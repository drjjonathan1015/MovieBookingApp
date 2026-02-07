import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

// Currency formatter (Sri Lanka)
const formatLKR = (amount) =>
  `Rs ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
  })}`;

export async function generateTicketAndInvoice(bookingData) {

  /* ===============================
     A5 SIZE (Mobile Friendly)
     =============================== */
  const doc = new jsPDF("p", "mm", "a5");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  /* =====================================================
     PAGE 1 – DARK MODE MOVIE TICKET
  ===================================================== */

  // Background
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Header
  doc.setFillColor(66, 184, 131);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo
  try {
    doc.addImage("/logo.png", "PNG", margin, 6, 20, 16);
  } catch (e) {}

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MOVIE TICKET", pageWidth / 2, 18, { align: "center" });

  let y = 40;

  // Movie title
  doc.setFontSize(15);
  doc.text(bookingData.movieTitle, pageWidth / 2, y, {
    align: "center",
    maxWidth: pageWidth - margin * 2,
  });

  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 220);

  const ticketRows = [
    ["Booking ID", bookingData.id],
    ["Date", bookingData.showDate],
    ["Time", bookingData.showTime],
    ["Seats", bookingData.seats.join(", ")],
  ];

  ticketRows.forEach(([label, value]) => {
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - margin, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  // Total Price
  y += 6;
  doc.setFillColor(66, 184, 131);
  doc.roundedRect(margin, y - 6, pageWidth - margin * 2, 12, 3, 3, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(
    `TOTAL : ${formatLKR(bookingData.totalPrice)}`,
    pageWidth / 2,
    y + 2,
    { align: "center" }
  );

  // QR Code
  y += 22;
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text("Scan at Theater Entrance", pageWidth / 2, y, {
    align: "center",
  });

  const qrData = JSON.stringify({
    id: bookingData.id,
    movie: bookingData.movieTitle,
    date: bookingData.showDate,
    time: bookingData.showTime,
    seats: bookingData.seats,
  });

  const qrImg = await QRCode.toDataURL(qrData);
  doc.addImage(qrImg, "PNG", pageWidth / 2 - 22, y + 5, 44, 44);

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Please arrive 15 minutes before showtime",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  /* =====================================================
     PAGE 2 – INVOICE (LIGHT MODE)
  ===================================================== */

  doc.addPage();

  // Header
  doc.setFillColor(66, 184, 131);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, 17);

  // Logo
  try {
    doc.addImage("/logo.png", "PNG", pageWidth - 32, 5, 20, 15);
  } catch (e) {}

  let iy = 35;
  doc.setTextColor(44, 62, 80);

  // Theater Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CinemaX (Pvt) Ltd", margin, iy);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Colombo, Sri Lanka", margin, iy + 6);
  doc.text("Phone: +94 11 234 5678", margin, iy + 11);
  doc.text("Email: info@cinemax.com", margin, iy + 16);

  iy += 28;

  // Invoice info
  doc.text(`Invoice No : INV-${bookingData.id.slice(0, 8)}`, margin, iy);
  doc.text(`Payment Method : ${bookingData.paymentMethod || "CARD"}`, margin, iy + 6);
  doc.text(`Status : PAID`, margin, iy + 12);

  iy += 20;

  // Invoice Table
  doc.autoTable({
    startY: iy,
    theme: "grid",
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [44, 62, 80],
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    margin: { left: margin, right: margin },
    head: [["Item", "Details"]],
    body: [
      ["Movie", bookingData.movieTitle],
      ["Date", bookingData.showDate],
      ["Time", bookingData.showTime],
      ["Seats", bookingData.seats.join(", ")],
      ["Quantity", bookingData.seats.length.toString()],
    ],
  });

  const fy = doc.lastAutoTable.finalY + 10;

  // Total Box
  doc.setFillColor(66, 184, 131);
  doc.roundedRect(pageWidth - margin - 70, fy, 70, 12, 3, 3, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    formatLKR(bookingData.totalPrice),
    pageWidth - margin - 35,
    fy + 8,
    { align: "center" }
  );

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This is a computer-generated invoice",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
}

export async function downloadTicketAndInvoice(bookingData) {
  try {
    const doc = await generateTicketAndInvoice(bookingData);
    doc.save(`CinemaX-Ticket-${bookingData.id}.pdf`);

    return { success: true };
  } catch (error) {
    console.error("PDF error:", error);
    return { success: false, error: error.message };
  }
}


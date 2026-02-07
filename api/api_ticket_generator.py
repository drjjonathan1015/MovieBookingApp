#!/usr/bin/env python3
"""
Enhanced PDF Generator: Ticket + Invoice merged
Install: pip install reportlab qrcode pillow flask flask-cors --break-system-packages
Run: python api_ticket_generator.py
"""

from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
import qrcode
import io
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)


def generate_qr_code(data):
    """Generate QR code and return as image bytes"""
    qr = qrcode.QRCode(version=1, box_size=5, border=2)
    qr.add_data(json.dumps(data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    """Generate merged Ticket + Invoice PDF"""
    try:
        booking_data = request.json

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        #######################
        # PAGE 1: TICKET
        #######################

        # Header: colored bar
        c.setFillColor(colors.HexColor("#42b883"))
        c.rect(0, height - 80, width, 80, fill=True, stroke=False)

        # Title
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(width / 2, height - 45, "🎬 MOVIE TICKET")

        # Booking ID
        c.setFont("Helvetica", 12)
        c.drawCentredString(width / 2, height - 65, f"Booking ID: {booking_data['id']}")

        # Reset color to black
        c.setFillColor(colors.black)

        # Movie details
        y = height - 120
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, y, booking_data.get("movieTitle", "Movie"))

        y -= 25
        c.setFont("Helvetica", 12)
        c.drawString(50, y, f"📅 Date: {booking_data.get('showDate', 'N/A')}")
        y -= 20
        c.drawString(50, y, f"🕐 Time: {booking_data.get('showTime', 'N/A')}")
        y -= 20
        seats = ', '.join(booking_data.get("seats", []))
        c.drawString(50, y, f"💺 Seats: {seats}")
        y -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, f"💰 Total: Rs {booking_data.get('totalPrice', 0)}")

        # Theater info
        y -= 30
        c.setFont("Helvetica", 11)
        c.drawString(50, y, "🏢 Theater: Grand Cinema, Colombo")
        y -= 15
        c.drawString(50, y, "📍 Address: 123 Cinema Street, Colombo 00100")
        y -= 15
        c.drawString(50, y, "📞 Tel: +94 11 234 5678")

        # Add dashed line
        y -= 30
        c.setDash(6, 3)
        c.setStrokeColor(colors.grey)
        c.line(50, y, width - 50, y)
        c.setDash()

        # QR Code
        y -= 160
        qr_data = {
            "bookingId": booking_data["id"],
            "movieTitle": booking_data.get("movieTitle"),
            "showDate": booking_data.get("showDate"),
            "seats": booking_data.get("seats"),
        }
        qr_bytes = generate_qr_code(qr_data)
        c.drawImage(qr_bytes, width / 2 - 75, y, 150, 150)

        # Footer
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(colors.grey)
        c.drawCentredString(width / 2, 60, "Present this ticket at the theater entrance")
        c.drawCentredString(width / 2, 45, "Thank you for booking with us!")

        c.showPage()  # New page for Invoice

        #######################
        # PAGE 2: INVOICE
        #######################

        # Invoice Header
        c.setFillColor(colors.HexColor("#42b883"))
        c.rect(0, height - 80, width, 80, fill=True, stroke=False)

        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 45, "💳 INVOICE")

        # Invoice details
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 70, f"Invoice #: INV-{booking_data['id']}")
        c.drawString(50, height - 90, f"Date: {datetime.now().strftime('%Y-%m-%d')}")

        # Company info (right)
        c.setFont("Helvetica-Bold", 12)
        c.drawRightString(width - 50, height - 45, "Movie Booking (Pvt) Ltd")
        c.setFont("Helvetica", 10)
        c.drawRightString(width - 50, height - 60, "123 Cinema Street, Colombo")
        c.drawRightString(width - 50, height - 72, "Tel: +94 11 234 5678")

        # Booking details table
        y = height - 130
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Booking Details:")

        y -= 20
        details = [
            ["Movie", booking_data.get("movieTitle", "N/A")],
            ["Show Date", booking_data.get("showDate", "N/A")],
            ["Show Time", booking_data.get("showTime", "N/A")],
            ["Seats", seats],
            ["Number of Seats", str(len(booking_data.get("seats", [])))],
        ]
        table = Table(details, colWidths=[120, width - 150])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#42b883")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 11),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f4f4f4")),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ]
            )
        )
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, y - 100)

        # Payment summary
        y -= 160
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Payment Details:")
        y -= 20
        c.setFont("Helvetica", 11)
        c.drawString(50, y, f"Payment Method: {booking_data.get('paymentMethod', 'Card')}")
        y -= 18
        c.drawString(50, y, f"Status: Paid")
        y -= 25
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, f"Total Amount: Rs {booking_data.get('totalPrice', 0)}")

        # Footer
        c.setFont("Helvetica-Oblique", 9)
        c.setFillColor(colors.grey)
        c.drawCentredString(
            width / 2,
            50,
            "This is a computer-generated invoice and does not require a signature.",
        )

        c.save()
        buffer.seek(0)

        response = make_response(buffer.getvalue())
        response.headers["Content-Type"] = "application/pdf"
        response.headers[
            "Content-Disposition"
        ] = f'attachment; filename=ticket-invoice-{booking_data["id"]}-{int(datetime.now().timestamp())}.pdf'
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Starting Enhanced PDF Generator API on http://localhost:5000")
    print("Endpoint: POST /api/generate-pdf")
    app.run(debug=True, port=5000)

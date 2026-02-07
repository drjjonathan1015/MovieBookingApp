<template>
  <div class="success-page">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading booking details...</p>
    </div>

    <!-- Success Content -->
    <div v-else-if="bookingData" class="success-container">
      <!-- Lottie Animation -->
      <div class="lottie-container">
        <Vue3Lottie
          :animationData="SuccessAnimation"
          :width="lottieWidth"
          :loop="false"
          :autoPlay="true"
        />
      </div>

      <h1 class="success-title">Payment Successful! 🎉</h1>
      <p class="success-message">Your booking has been confirmed</p>

      <!-- Booking Card -->
      <div class="booking-card">
        <div class="card-header">
          <h2>Booking Details</h2>
          <span class="booking-id">ID: {{ bookingData.id }}</span>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="label">🎬 Movie:</span>
            <span class="value">{{ bookingData.movieTitle }}</span>
          </div>
          <div class="detail-row">
            <span class="label">📅 Date:</span>
            <span class="value">{{ bookingData.showDate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">🕐 Time:</span>
            <span class="value">{{ bookingData.showTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">💺 Seats:</span>
            <span class="value">{{ bookingData.seats.join(', ') }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">💰 Total Paid:</span>
            <span class="value">Rs {{ bookingData.totalPrice }}</span>
          </div>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
          <h3>Scan at Theater</h3>
          <div class="qr-code-container">
            <canvas ref="qrCanvas" class="qr-canvas"></canvas>
          </div>
          <p class="qr-instruction">Show this QR code at the entrance</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="downloadTicket" class="btn-primary" :disabled="downloading">
          <span v-if="downloading">Generating...</span>
          <span v-else>🎟️ Download Ticket & Invoice PDF</span>
        </button>

        <button @click="sendEmail" class="btn-email" :disabled="emailSent || sending">
          <span v-if="sending">📤 Sending Email...</span>
          <span v-else-if="emailSent">✅ Email Sent Successfully</span>
          <span v-else>📧 Send Confirmation Email</span>
        </button>
      </div>

      <!-- Navigation Buttons -->
      <div class="nav-buttons">
        <router-link to="/my-bookings" class="btn-nav">
          View All Bookings
        </router-link>
        <router-link to="/movies" class="btn-nav secondary">
          Browse More Movies
        </router-link>
      </div>

      <!-- Confirmation Messages -->
      <div class="email-notice success" v-if="emailSent && !emailError">
        <p>✅ Confirmation email sent successfully to {{ userEmail }}!</p>
        <small>Please check your inbox (and spam folder)</small>
      </div>

      <div class="email-notice error" v-if="emailError">
        <p>⚠️ {{ emailError }}</p>
        <button @click="sendEmail" class="retry-btn" :disabled="sending">
          Try Again
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <p>⚠️ Booking not found</p>
      <router-link to="/movies" class="btn-primary">Back to Movies</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { Vue3Lottie } from 'vue3-lottie';
import SuccessAnimation from '../assets/payment-success.json';
import { sendBookingConfirmation, validateEmailConfig } from '../services/emailService';

const route = useRoute();
const router = useRouter();

const bookingData = ref(null);
const loading = ref(true);
const downloading = ref(false);
const emailSent = ref(false);
const sending = ref(false);
const emailError = ref('');
const qrCanvas = ref(null);
const userEmail = ref('');
const userName = ref('');

const bookingId = route.query.bookingId;

// Responsive Lottie width
const lottieWidth = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 ? 250 : 500;
  }
  return 500;
});

onMounted(async () => {
  await nextTick();

  if (!bookingId) {
    router.push("/movies");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    userEmail.value = user.email || '';
    userName.value = user.displayName || 'Customer';

    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      loading.value = false;
      return;
    }

    const data = bookingSnap.data();
    bookingData.value = {
      id: bookingSnap.id,
      seats: Array.isArray(data.seats) ? data.seats : JSON.parse(data.seats || "[]"),
      movieTitle: data.movieTitle || "Movie",
      showDate: data.showDate || "N/A",
      showTime: data.showTime || "N/A",
      totalPrice: data.totalPrice || 0,
      status: data.status,
      paymentMethod: data.paymentMethod || "Online Payment",
      theaterName: data.theaterName || "Cinema Hall"
    };

    loading.value = false;

    await nextTick();
    generateQRCode();

  } catch (err) {
    console.error("Error fetching booking:", err);
    loading.value = false;
  }
});

const generateQRCode = async () => {
  if (!qrCanvas.value || !bookingData.value) return;

  const qrData = JSON.stringify({
    bookingId: bookingData.value.id,
    movieTitle: bookingData.value.movieTitle,
    showDate: bookingData.value.showDate,
    showTime: bookingData.value.showTime,
    seats: bookingData.value.seats,
    totalPrice: bookingData.value.totalPrice
  });

  // Responsive QR code size
  const qrSize = window.innerWidth < 768 ? 200 : 250;

  try {
    await QRCode.toCanvas(qrCanvas.value, qrData, {
      width: qrSize,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  } catch (err) {
    console.error("QR code generation error:", err);
  }
};

const downloadTicket = async () => {
  downloading.value = true;
  try {
    const { downloadTicketAndInvoice } = await import('../utils/pdfGenerator.js');
    const result = await downloadTicketAndInvoice(bookingData.value);
    if (!result.success) throw new Error(result?.error || "PDF generation failed");
  } catch (err) {
    console.error(err);
    alert("Failed to download ticket. Please try again.");
  } finally {
    downloading.value = false;
  }
};

const sendEmail = async () => {
  if (!validateEmailConfig()) {
    emailError.value = 'Email service not configured. Please contact support.';
    console.error('EmailJS is not properly configured. Check emailConfig.js');
    return;
  }

  if (!userEmail.value) {
    emailError.value = 'No email address found. Please update your profile.';
    return;
  }

  sending.value = true;
  emailError.value = '';

  try {
    const result = await sendBookingConfirmation(
      bookingData.value,
      userEmail.value,
      userName.value
    );

    if (result.success) {
      emailSent.value = true;
      console.log("Confirmation email sent to:", userEmail.value);
    } else {
      throw new Error(result.message || 'Failed to send email');
    }

  } catch (err) {
    console.error('Email sending error:', err);
    emailError.value = err.message || 'Failed to send confirmation email. Please try again.';
  } finally {
    sending.value = false;
  }
};
</script>

<style scoped>
/* Lottie Animation Container - RESPONSIVE */
.lottie-container {
  width: 100%;
  max-width: 500px;
  height: auto;
  margin: 0 auto 20px auto;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-color);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-color);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66,184,131,0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.success-container {
  max-width: 700px;
  width: 100%;
}

.success-title {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-align: center;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.success-message {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.booking-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow);
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.5s both;
  border: 1px solid var(--border-color);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-header h2 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0;
}

.booking-id {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  font-family: 'Courier New', monospace;
  background: var(--bg-color);
  padding: 0.25rem 0.75rem;
  border-radius: 5px;
  border: 1px solid var(--border-color);
}

.card-body {
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--primary-color);
  font-size: 1.1rem;
  font-weight: 700;
}

.label {
  color: var(--text-color);
  opacity: 0.8;
  font-weight: 600;
  flex-shrink: 0;
}

.value {
  color: var(--text-color);
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.detail-row.total .value {
  color: var(--primary-color);
  font-size: 1.3rem;
}

/* QR Code Section */
.qr-section {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-color);
  border-radius: 15px;
  margin-top: 1.5rem;
  border: 1px solid var(--border-color);
}

.qr-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
  font-size: 1.2rem;
}

.qr-code-container {
  display: inline-block;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.qr-instruction {
  margin-top: 1rem;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.btn-primary,
.btn-secondary,
.btn-email {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(66, 184, 131, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.btn-email {
  background: #3498db;
  color: white;
}

.btn-email:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(52, 152, 219, 0.4);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-email:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  gap: 1rem;
  animation: fadeInUp 0.6s ease-out 0.7s both;
}

.btn-nav {
  flex: 1;
  padding: 1rem;
  background: var(--card-bg);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}

.btn-nav:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.btn-nav.secondary {
  background: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-nav.secondary:hover {
  background: var(--primary-color);
  color: white;
}

/* Email Notice */
.email-notice {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
  border: 1px solid;
}

.email-notice.success {
  background: rgba(66, 184, 131, 0.1);
  border-color: var(--primary-color);
  color: var(--text-color);
}

.email-notice.error {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
  color: #e74c3c;
}

.email-notice p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.email-notice small {
  opacity: 0.8;
  font-size: 0.85rem;
}

.retry-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.retry-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Error State */
.error-state {
  text-align: center;
  color: var(--text-color);
  padding: 2rem;
}

.error-state p {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .success-page {
    padding: 1rem;
  }
  
  .lottie-container {
    max-width: 250px;
    height: auto;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
  
  .booking-card {
    padding: 1.5rem 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header h2 {
    font-size: 1.3rem;
  }
  
  .booking-id {
    font-size: 0.8rem;
    word-break: break-all;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .value {
    text-align: left;
  }
  
  .detail-row.total {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .detail-row.total .value {
    text-align: right;
    font-size: 1.2rem;
  }
  
  .qr-section {
    padding: 1rem;
  }
  
  .qr-section h3 {
    font-size: 1.1rem;
  }
  
  .qr-code-container {
    padding: 0.75rem;
  }
  
  .nav-buttons {
    flex-direction: column;
  }
  
  .btn-nav {
    width: 100%;
  }
  
  .action-buttons button {
    font-size: 0.95rem;
    padding: 0.875rem 1.25rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .success-page {
    padding: 0.5rem;
  }
  
  .success-title {
    font-size: 1.3rem;
  }
  
  .booking-card {
    padding: 1rem 0.75rem;
    border-radius: 10px;
  }
  
  .qr-code-container canvas {
    width: 180px !important;
    height: 180px !important;
  }
  
  .label {
    font-size: 0.9rem;
  }
  
  .value {
    font-size: 0.9rem;
  }
}
</style>
<template>
  <div class="seat-selection-page">
    <!-- Header -->
    <div class="booking-header">
      <a @click="router.back()" class="back-link">← Back</a>
      <div class="show-info">
        <h1>💳 Complete Payment</h1>
      </div>
    </div>

    <!-- Booking Summary -->
    <div v-if="bookingData" class="booking-summary">
      <div class="summary-content">
        <div class="price-row">
          <span>Booking ID:</span>
          <strong>{{ bookingData.id }}</strong>
        </div>
        <div class="price-row">
          <span>Movie:</span>
          <strong>{{ bookingData.movieTitle }}</strong>
        </div>
        <div class="price-row">
          <span>Seats:</span>
          <span class="seat-tags">
            <span v-for="seat in bookingData.seats" :key="seat" class="seat-tag">{{ seat }}</span>
          </span>
        </div>
        <div class="price-row">
          <span>Date:</span>
          <span>{{ bookingData.showDate }}</span>
        </div>
        <div class="price-row">
          <span>Time:</span>
          <span>{{ bookingData.showTime }}</span>
        </div>
        <div class="price-row total">
          <span>Total Amount:</span>
          <strong>Rs {{ bookingData.totalPrice }}</strong>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <div class="spinner"></div>
      <p>Loading booking details...</p>
    </div>

    <!-- Payment Method Selection -->
    <div class="booking-summary" v-if="bookingData">
      <div class="summary-content">
        <h2 class="payment-title">Select Payment Method</h2>
        
        <div class="payment-methods">
          <label class="payment-option" :class="{ selected: paymentMethod === 'card' }">
            <input type="radio" v-model="paymentMethod" value="card" class="payment-radio" />
            <div class="payment-content">
              <span class="payment-icon">💳</span>
              <div class="payment-info">
                <div class="payment-name">Credit/Debit Card</div>
                <div class="payment-desc">Visa, Mastercard, Amex</div>
              </div>
            </div>
          </label>

          <label class="payment-option" :class="{ selected: paymentMethod === 'mobile' }">
            <input type="radio" v-model="paymentMethod" value="mobile" class="payment-radio" />
            <div class="payment-content">
              <span class="payment-icon">📱</span>
              <div class="payment-info">
                <div class="payment-name">Mobile Payment</div>
                <div class="payment-desc">Dialog, Mobitel, Hutch</div>
              </div>
            </div>
          </label>

          <label class="payment-option" :class="{ selected: paymentMethod === 'bank' }">
            <input type="radio" v-model="paymentMethod" value="bank" class="payment-radio" />
            <div class="payment-content">
              <span class="payment-icon">🏦</span>
              <div class="payment-info">
                <div class="payment-name">Bank Transfer</div>
                <div class="payment-desc">Online Banking</div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Card Payment Form -->
    <div v-if="paymentMethod === 'card' && bookingData" class="booking-summary">
      <div class="summary-content">
        <h3 class="form-title">Card Details</h3>
        
        <div class="form-fields">
          <div class="form-group">
            <label class="form-label">Card Number</label>
            <input
              v-model="cardDetails.number"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @input="formatCardNumber"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Cardholder Name</label>
            <input
              v-model="cardDetails.name"
              type="text"
              placeholder="John Doe"
              class="form-input"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Expiry Date</label>
              <input
                v-model="cardDetails.expiry"
                type="text"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiry"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">CVV</label>
              <input
                v-model="cardDetails.cvv"
                type="text"
                placeholder="123"
                maxlength="3"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Payment Form -->
    <div v-if="paymentMethod === 'mobile' && bookingData" class="booking-summary">
      <div class="summary-content">
        <h3 class="form-title">Mobile Payment Details</h3>
        
        <div class="form-fields">
          <div class="form-group">
            <label class="form-label">Mobile Provider</label>
            <select v-model="mobileDetails.provider" class="form-input">
              <option value="">Select Provider</option>
              <option value="dialog">Dialog</option>
              <option value="mobitel">Mobitel</option>
              <option value="hutch">Hutch</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Mobile Number</label>
            <input
              v-model="mobileDetails.number"
              type="tel"
              placeholder="07XXXXXXXX"
              maxlength="10"
              class="form-input"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bank Transfer Info -->
    <div v-if="paymentMethod === 'bank' && bookingData" class="booking-summary">
      <div class="summary-content">
        <h3 class="form-title">Bank Transfer Instructions</h3>
        
        <div class="bank-info">
          <p class="bank-intro">Please transfer the amount to:</p>
          <div class="bank-details">
            <p><strong>Bank:</strong> Commercial Bank</p>
            <p><strong>Account:</strong> 1234567890</p>
            <p><strong>Name:</strong> Movie Booking (Pvt) Ltd</p>
            <p><strong>Branch:</strong> Colombo</p>
          </div>
          <p class="bank-warning">
            ⚠️ After transfer, send the receipt to payment@moviebooking.lk with booking reference: <strong>{{ bookingData.id }}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="router.back()" class="btn-back">
        ← Back
      </button>
      <button
        @click="processPayment"
        :disabled="!canProceed || processing"
        class="btn-confirm"
      >
        <span v-if="processing">Processing...</span>
        <span v-else>Pay Rs {{ bookingData?.totalPrice }}</span>
      </button>
    </div>

    <!-- Security Info -->
    <p style="text-align:center; margin-top:1rem; color:gray;">
      🔒 Your payment is secure and encrypted
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";

const router = useRouter();

const bookingData = ref(null);
const paymentMethod = ref("");
const processing = ref(false);

// Card payment details
const cardDetails = ref({
  number: "",
  name: "",
  expiry: "",
  cvv: ""
});

// Mobile payment details
const mobileDetails = ref({
  provider: "",
  number: ""
});

// Computed property to check if payment can proceed
const canProceed = computed(() => {
  if (!paymentMethod.value || !bookingData.value) return false;
  
  if (paymentMethod.value === 'card') {
    return cardDetails.value.number.length >= 15 &&
           cardDetails.value.name.length >= 3 &&
           cardDetails.value.expiry.length === 5 &&
           cardDetails.value.cvv.length === 3;
  }
  
  if (paymentMethod.value === 'mobile') {
    return mobileDetails.value.provider &&
           mobileDetails.value.number.length === 10;
  }
  
  if (paymentMethod.value === 'bank') {
    return true; // Bank transfer just needs method selection
  }
  
  return false;
});

// Format card number with spaces
const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\s/g, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  cardDetails.value.number = formattedValue;
};

// Format expiry date as MM/YY
const formatExpiry = (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  cardDetails.value.expiry = value;
};

onMounted(async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    // Fetch the latest PENDING booking for current user
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", user.uid),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No pending booking found!");
      router.push("/movies");
      return;
    }

    // Get the most recent pending booking
    let latestBooking = snapshot.docs[0];
    snapshot.docs.forEach(doc => {
      if (doc.data().createdAt > latestBooking.data().createdAt) {
        latestBooking = doc;
      }
    });

    const data = latestBooking.data();

    bookingData.value = {
      id: latestBooking.id,
      seats: Array.isArray(data.seats) ? data.seats : JSON.parse(data.seats || "[]"),
      movieTitle: data.movieTitle || "Movie",
      showDate: data.showDate || "N/A",
      showTime: data.showTime || "N/A",
      totalPrice: data.totalPrice || 0,
      showId: data.showId || "",
      movieId: data.movieId || ""
    };

    console.log("Loaded booking:", bookingData.value);

  } catch (err) {
    console.error("Error fetching booking:", err);
    alert("Failed to fetch booking data");
  }
});

const processPayment = async () => {
  if (!canProceed.value) {
    alert("Please fill in all required payment details!");
    return;
  }

  processing.value = true;

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Prepare payment details based on method
    let paymentDetails = { method: paymentMethod.value };
    
    if (paymentMethod.value === 'card') {
      paymentDetails.cardLast4 = cardDetails.value.number.slice(-4);
      paymentDetails.cardHolder = cardDetails.value.name;
    } else if (paymentMethod.value === 'mobile') {
      paymentDetails.provider = mobileDetails.value.provider;
      paymentDetails.mobileNumber = mobileDetails.value.number;
    }

    // Update booking status to confirmed
    const bookingRef = doc(db, "bookings", bookingData.value.id);
    await updateDoc(bookingRef, {
      status: "confirmed",
      paymentMethod: paymentMethod.value,
      paymentDetails: paymentDetails,
      paidAt: new Date().toISOString()
    });

    // Update seat status to booked
    const { movieId, showId, seats } = bookingData.value;
    
    if (movieId && showId && seats.length > 0) {
      // Get all seats in the show
      const seatsRef = collection(db, "movies", movieId, "shows", showId, "seats");
      const seatsSnapshot = await getDocs(seatsRef);
      
      // Update each selected seat to booked
      const updatePromises = seatsSnapshot.docs
        .filter(seatDoc => seats.includes(seatDoc.data().seatNumber))
        .map(seatDoc => updateDoc(doc(db, "movies", movieId, "shows", showId, "seats", seatDoc.id), {
          isBooked: true
        }));
      
      await Promise.all(updatePromises);
      console.log("Seats marked as booked");
    }

    alert(`✅ Payment successful! Booking confirmed.\n\nBooking ID: ${bookingData.value.id}\nSeats: ${seats.join(', ')}`);
    router.push({
      path: '/payment-success',
      query: { bookingId: bookingData.value.id }
    });
    
  } catch (err) {
    console.error("Error processing payment:", err);
    alert("Payment failed. Please try again.");
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
/* Page Layout */
.seat-selection-page { 
  min-height:100vh; 
  padding:2rem; 
  background:var(--bg-color,#f4f4f4); 
  color:var(--text-color,#333);
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.booking-header { margin-bottom:2rem; }
.back-link { 
  text-decoration:none;
  color:var(--primary-color,#42b883); 
  font-weight:600; 
  display:inline-block; 
  margin-bottom:1rem; 
  cursor:pointer;
  transition: all 0.3s;
}
.back-link:hover { opacity: 0.8; }
.show-info h1{ 
  font-size:2rem;
  color:var(--text-color,#333); 
  margin-bottom:0.5rem;
}

/* Summary Cards */
.booking-summary{ 
  background:var(--card-bg,#fff); 
  padding:2rem; 
  border-radius:15px; 
  box-shadow:0 2px 10px rgba(0,0,0,0.1); 
  margin-bottom:1.5rem;
}
.summary-content{ max-width:800px; margin:0 auto;}
.price-row{ 
  display:flex; 
  justify-content:space-between; 
  padding:0.75rem 0; 
  color:var(--text-color,#333);
  border-bottom: 1px solid var(--border-color, #eee);
}
.price-row:last-child { border-bottom: none; }
.price-row.total{ 
  border-top:2px solid var(--border-color,#ddd); 
  font-size:1.2rem; 
  margin-top:0.5rem;
  padding-top: 1rem;
}
.price-row.total strong{ 
  color:var(--primary-color,#42b883); 
  font-size:1.5rem;
}

/* Seat Tags */
.seat-tags{ display:flex; flex-wrap:wrap; gap:0.5rem;}
.seat-tag{ 
  padding:0.4rem 0.8rem; 
  background:var(--primary-color,#42b883); 
  color:white; 
  border-radius:5px; 
  font-weight:600;
  font-size: 0.9rem;
}

/* Payment Methods */
.payment-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-color, #333);
  margin-bottom: 1.5rem;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 2px solid var(--border-color, #ddd);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--card-bg, #fff);
}

.payment-option:hover {
  border-color: var(--primary-color, #42b883);
  background: rgba(66, 184, 131, 0.1);
}

.payment-option.selected {
  border-color: var(--primary-color, #42b883);
  background: rgba(66, 184, 131, 0.15);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.payment-radio {
  margin-right: 1rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color, #42b883);
}

.payment-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.payment-icon {
  font-size: 2rem;
}

.payment-info {
  flex: 1;
}

.payment-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color, #333);
  margin-bottom: 0.25rem;
}

.payment-desc {
  font-size: 0.85rem;
  color: #888;
  opacity: 0.9;
}

/* Form Styles */
.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color, #333);
  margin-bottom: 1.5rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color, #ddd);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #42b883);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-input::placeholder {
  color: #999;
  opacity: 0.7;
}

/* Dark mode specific for select dropdown */
.form-input option {
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
}

/* Bank Transfer Info */
.bank-info {
  background: rgba(66, 184, 131, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(66, 184, 131, 0.2);
}

.bank-intro {
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.bank-details {
  font-family: 'Courier New', monospace;
  margin-bottom: 1rem;
  line-height: 1.8;
}

.bank-details p {
  margin: 0.25rem 0;
  color: var(--text-color, #333);
}

.bank-details strong {
  color: var(--text-color, #333);
  font-weight: 700;
}

.bank-warning {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.15);
  border-left: 4px solid #ffc107;
  border-radius: 5px;
  font-size: 0.9rem;
  color: var(--text-color, #333);
}

.bank-warning strong {
  color: var(--primary-color, #42b883);
  font-weight: 700;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-back {
  flex: 1;
  padding: 1rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-confirm { 
  flex: 2;
  padding: 1rem 1.5rem; 
  background: var(--primary-color, #42b883); 
  color: white; 
  border: none; 
  border-radius: 10px; 
  font-size: 1rem; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s;
}

.btn-confirm:hover:not(:disabled) { 
  background: #36a06b; 
  transform: translateY(-2px); 
  box-shadow: 0 5px 20px rgba(66,184,131,0.3);
}

.btn-confirm:disabled { 
  background: #95a5a6; 
  cursor: not-allowed;
  transform: none;
}

/* Loading */
.loading { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 200px; 
  color: gray;
}

.spinner { 
  width: 50px; 
  height: 50px; 
  border: 4px solid rgba(66,184,131,0.3); 
  border-top-color: var(--primary-color,#42b883); 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
  margin-bottom: 1rem;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Mobile Responsive */
@media(max-width: 768px) {
  .seat-selection-page {
    padding: 1rem;
  }
  
  .booking-summary {
    padding: 1.25rem;
  }
  
  .payment-option {
    padding: 1rem;
  }
  
  .payment-icon {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-back, .btn-confirm {
    width: 100%;
  }
}
</style>
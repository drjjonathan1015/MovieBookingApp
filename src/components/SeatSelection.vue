<template>
  <div class="seat-selection-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading seats...</p>
    </div>

    <div v-else class="seat-selection-container">
      <!-- Header Info -->
      <div class="booking-header">
        <router-link to="/movies" class="back-link">← Back to Movies</router-link>
        <div class="show-info">
          <h1>{{ showInfo.movieTitle || 'Select Your Seats' }}</h1>
          <div class="show-details">
            <span v-if="showInfo.date">📅 {{ formatDate(showInfo.date) }}</span>
            <span v-if="showInfo.time">🕐 {{ showInfo.time }}</span>
            <span>💰 Rs. {{ showPrice }} per seat</span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="seat-legend">
        <div class="legend-item">
          <div class="seat-icon available"></div>
          <span>Available</span>
        </div>
        <div class="legend-item">
          <div class="seat-icon selected"></div>
          <span>Selected</span>
        </div>
        <div class="legend-item">
          <div class="seat-icon booked"></div>
          <span>Booked</span>
        </div>
      </div>

      <!-- Screen -->
      <div class="screen-container">
        <div class="screen">SCREEN</div>
      </div>

<!-- Seats Grid -->
<div class="seats-container">
  <div v-for="row in seatRows" :key="row" class="seat-row">
    <div class="row-label">{{ row }}</div>

    <!-- Left Section -->
    <div class="seats-section left-section">
      <button
        v-for="seat in getSeatsInRow(row).slice(0,5)"
        :key="seat.id"
        @click="toggleSeat(seat)"
        :class="['seat', seat.isBooked ? 'booked' : selectedSeats.includes(seat.seatNumber) ? 'selected' : 'available']"
        :disabled="seat.isBooked"
      >
        {{ seat.seatNumber }}
      </button>
    </div>

    <!-- Center Section -->
    <div class="seats-section center-section">
      <button
        v-for="seat in getSeatsInRow(row).slice(5,10)"
        :key="seat.id"
        @click="toggleSeat(seat)"
        :class="['seat', seat.isBooked ? 'booked' : selectedSeats.includes(seat.seatNumber) ? 'selected' : 'available']"
        :disabled="seat.isBooked"
      >
        {{ seat.seatNumber }}
      </button>
    </div>

    <!-- Right Section -->
    <div class="seats-section right-section">
      <button
        v-for="seat in getSeatsInRow(row).slice(10,15)"
        :key="seat.id"
        @click="toggleSeat(seat)"
        :class="['seat', seat.isBooked ? 'booked' : selectedSeats.includes(seat.seatNumber) ? 'selected' : 'available']"
        :disabled="seat.isBooked"
      >
        {{ seat.seatNumber }}
      </button>
    </div>

    <div class="row-label">{{ row }}</div>
  </div>
</div>


      <!-- Booking Summary -->
      <div class="booking-summary">
        <div class="summary-content">
          <div class="selected-info">
            <h3>Selected Seats</h3>
            <div class="selected-seats-list">
              <span v-if="selectedSeats.length === 0" class="no-selection">No seats selected</span>
              <span v-else class="seat-tags">
                <span v-for="seat in selectedSeats" :key="seat" class="seat-tag">{{ seat }}</span>
              </span>
            </div>
          </div>

          <div class="price-summary">
            <div class="price-row">
              <span>Number of Seats:</span>
              <strong>{{ selectedSeats.length }}</strong>
            </div>
            <div class="price-row">
              <span>Price per Seat:</span>
              <strong>Rs. {{ showPrice }}</strong>
            </div>
            <div class="price-row total">
              <span>Total Amount:</span>
              <strong>Rs. {{ totalPrice }}</strong>
            </div>
          </div>

          <button
            @click="confirmBooking"
            class="btn-confirm"
            :disabled="selectedSeats.length === 0 || isBooking"
          >
            {{ isBooking ? 'Processing...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db, auth } from "../firebase";
import { doc, collection, getDocs, updateDoc, setDoc, getDoc, addDoc } from "firebase/firestore";

const route = useRoute();
const router = useRouter();
const showId = route.params.showId;
const movieId = route.query.movieId;

const seats = ref([]);
const selectedSeats = ref([]);
const showPrice = ref(200);
const showInfo = ref({});
const loading = ref(true);
const isBooking = ref(false);

const totalPrice = computed(() => selectedSeats.value.length * showPrice.value);

// Rows A-J
const seatRows = ["A","B","C","D","E","F","G","H","I","J"];

// Get seats in a row, sorted by number
const getSeatsInRow = (row) => {
  return seats.value
    .filter(s => s.seatNumber.startsWith(row))
    .sort((a,b) => {
      const numA = parseInt(a.seatNumber.slice(1));
      const numB = parseInt(b.seatNumber.slice(1));
      return numA - numB;
    });
};

// Toggle seat selection
const toggleSeat = seat => {
  if (seat.isBooked) return alert("This seat is already booked!");
  const index = selectedSeats.value.indexOf(seat.seatNumber);
  index > -1 ? selectedSeats.value.splice(index,1) : selectedSeats.value.push(seat.seatNumber);
};

// Fetch show info
const fetchShowInfo = async () => {
  try {
    if (!movieId) {
      const moviesSnap = await getDocs(collection(db, "movies"));
      for (const movieDoc of moviesSnap.docs) {
        const showDoc = await getDoc(doc(db, "movies", movieDoc.id, "shows", showId));
        if (showDoc.exists()) {
          const data = showDoc.data();
          showInfo.value = { 
            movieTitle: movieDoc.data().title, 
            date: data.date, 
            time: data.time 
          };
          showPrice.value = data.price || 200;
          // Store movieId for later use
          route.query.movieId = movieDoc.id;
          return movieDoc.id;
        }
      }
    } else {
      const showDoc = await getDoc(doc(db, "movies", movieId, "shows", showId));
      if (showDoc.exists()) {
        const data = showDoc.data();
        const movieDoc = await getDoc(doc(db, "movies", movieId));
        showInfo.value = { 
          movieTitle: movieDoc.data().title, 
          date: data.date, 
          time: data.time 
        };
        showPrice.value = data.price || 200;
        return movieId;
      }
    }
  } catch (err) { 
    console.error("Error fetching show info:", err); 
  }
  return null;
};

// Fetch seats
const fetchSeats = async (foundMovieId) => {
  try {
    loading.value = true;
    const effectiveMovieId = foundMovieId || movieId;
    if (!effectiveMovieId) { 
      router.push('/movies'); 
      return; 
    }

    const seatsCol = collection(db, "movies", effectiveMovieId, "shows", showId, "seats");
    const snap = await getDocs(seatsCol);

    if (snap.empty) {
      await createDefaultSeats(effectiveMovieId);
      await fetchSeats(effectiveMovieId);
      return;
    }

    seats.value = snap.docs.map(doc => ({
      id: doc.id,
      seatNumber: doc.data().seatNumber || doc.data().number,
      isBooked: doc.data().isBooked || false,
      price: doc.data().price || showPrice.value
    }));
  } catch (err) { 
    console.error("Error fetching seats:", err); 
  } finally { 
    loading.value = false; 
  }
};

// Create default seats: 5 left + 5 center + 5 right = 15 per row
const createDefaultSeats = async (movieId) => {
  const rows = ["A","B","C","D","E","F","G","H","I","J"];
  const seatsPerRow = 15;

  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      await setDoc(doc(collection(db, "movies", movieId, "shows", showId, "seats")), {
        seatNumber: `${row}${i}`,
        isBooked: false,
        price: showPrice.value
      });
    }
  }
};

// Confirm booking - CORRECTED VERSION
const confirmBooking = async () => {
  if (selectedSeats.value.length === 0) {
    alert("Please select at least one seat!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please login to continue");
    router.push("/login");
    return;
  }

  try {
    isBooking.value = true;

    const effectiveMovieId = route.query.movieId || movieId;
    
    // Create booking in Firestore
    const bookingRef = await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      movieId: effectiveMovieId,
      showId: showId,
      movieTitle: showInfo.value.movieTitle,
      showDate: showInfo.value.date || "",
      showTime: showInfo.value.time || "",
      seats: selectedSeats.value, // Store as array
      totalPrice: totalPrice.value,
      status: "pending", // Payment pending
      createdAt: new Date().toISOString()
    });

    console.log("Booking created with ID:", bookingRef.id);

    // Redirect to payment page
    router.push("/payment");
    
  } catch (err) {
    console.error("Error creating booking:", err);
    alert("Failed to create booking. Please try again.");
    isBooking.value = false;
  }
};

const formatDate = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
};

onMounted(async ()=>{
  const foundMovieId = await fetchShowInfo();
  await fetchSeats(foundMovieId);
});
</script>

<style scoped>
.seat-selection-page { min-height:100vh; padding:2rem; background:var(--bg-color);}
.loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px;}
.spinner { width:50px; height:50px; border:4px solid rgba(66,184,131,0.3); border-top-color:var(--primary-color); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem;}
@keyframes spin { to{transform:rotate(360deg);} }

.booking-header { margin-bottom:2rem; }
.back-link { text-decoration:none;color:var(--primary-color); font-weight:600; display:inline-block; margin-bottom:1rem;}
.show-info h1{ font-size:2rem;color:var(--text-color); margin-bottom:0.5rem;}
.show-details{ display:flex; gap:1.5rem; flex-wrap:wrap; color:var(--text-color); opacity:0.8;}

.seat-legend{ display:flex; justify-content:center; gap:2rem; margin-bottom:2rem;}
.legend-item{ display:flex; align-items:center; gap:0.5rem;}
.seat-icon{ width:30px;height:30px;border-radius:5px;border:2px solid var(--border-color);}
.seat-icon.available{ background:var(--card-bg);}
.seat-icon.selected{ background:var(--primary-color); border-color:var(--primary-color);}
.seat-icon.booked{ background:#e74c3c; border-color:#e74c3c;}

.screen-container{text-align:center;margin-bottom:2rem;}
.screen{ display:inline-block; padding:0.5rem 3rem; background:linear-gradient(to bottom,#333,#111); color:white; border-radius:10px 10px 50% 50%; font-weight:bold; letter-spacing:2px; box-shadow:0 5px 20px rgba(0,0,0,0.3);}

.seats-container{ margin-bottom:2rem;}
.seat-row{
  display: grid;
  grid-template-columns: 30px 1fr 1fr 1fr 30px;
  align-items: center;
  margin-bottom: 0.75rem;
}

.row-label{ font-weight:bold; min-width:20px; text-align:center;}
.seats-section{
  display:flex;
  justify-content: center;
  gap: 1.0rem;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .seat-selection-page {
    padding: 1rem;
  }

  .booking-header {
    margin-bottom: 1.5rem;
  }

  .show-info h1 {
    font-size: 1.5rem;
  }

  .show-details {
    gap: 1rem;
    font-size: 0.9rem;
  }

  .seat-legend {
    gap: 1rem;
    flex-wrap: wrap;
  }

  .legend-item {
    font-size: 0.85rem;
  }

  .seat-icon {
    width: 25px;
    height: 25px;
  }

  .screen {
    padding: 0.5rem 2rem;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }

  .seats-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .seat-row {
    grid-template-columns: 25px 1fr 1fr 1fr 25px;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .row-label {
    font-size: 0.85rem;
  }

  .seats-section {
    gap: 0.4rem;
  }

  .seat {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .booking-summary {
    padding: 1.5rem 1rem;
  }

  .selected-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .seat-tag {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .price-summary {
    padding: 1rem;
  }

  .price-row {
    font-size: 0.95rem;
  }

  .price-row.total {
    font-size: 1.1rem;
  }

  .price-row.total strong {
    font-size: 1.3rem;
  }

  .btn-confirm {
    padding: 1rem;
    font-size: 1rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .seat-selection-page {
    padding: 0.5rem;
  }

  .show-info h1 {
    font-size: 1.3rem;
  }

  .show-details {
    font-size: 0.85rem;
    gap: 0.75rem;
  }

  .seat-legend {
    gap: 0.75rem;
  }

  .screen {
    padding: 0.4rem 1.5rem;
    font-size: 0.85rem;
  }

  .seat-row {
    grid-template-columns: 20px 1fr 1fr 1fr 20px;
    gap: 0.2rem;
    margin-bottom: 0.4rem;
  }

  .row-label {
    font-size: 0.75rem;
  }

  .seats-section {
    gap: 0.3rem;
  }

  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .booking-summary {
    padding: 1rem 0.75rem;
  }

  .seat-tag {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }
}

/* Landscape mode on mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .seat {
    width: 30px;
    height: 30px;
  }

  .seat-row {
    margin-bottom: 0.4rem;
  }
}

.seat{ width:45px;height:45px;border-radius:8px;border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:600; transition:all 0.3s;}
.seat.available:hover{ transform:scale(1.1); border-color:var(--primary-color);}
.seat.selected{ background:var(--primary-color); color:white; border-color:var(--primary-color);}
.seat.booked{ background:#e74c3c; color:white; cursor:not-allowed; opacity:0.6;}

.booking-summary{ background:var(--card-bg); padding:2rem; border-radius:15px; box-shadow:0 -5px 30px rgba(0,0,0,0.1);}
.summary-content{ max-width:800px; margin:0 auto;}
.seat-tags{ display:flex; flex-wrap:wrap; gap:0.5rem;}
.seat-tag{ padding:0.5rem 1rem; background:var(--primary-color); color:white; border-radius:5px; font-weight:600;}
.price-summary{ padding:1.5rem; border-radius:10px; margin-bottom:1.5rem;}
.price-row{ display:flex; justify-content:space-between; padding:0.5rem 0; color:var(--text-color);}
.price-row.total{ border-top:2px solid var(--border-color); font-size:1.2rem; margin-top:0.5rem;}
.price-row.total strong{ color:var(--primary-color); font-size:1.5rem;}
.btn-confirm{ width:100%; padding:1.25rem; background:var(--primary-color); color:white; border:none; border-radius:10px; font-size:1.1rem; font-weight:600; cursor:pointer; transition:all 0.3s;}
.btn-confirm:hover:not(:disabled){ background:var(--primary-hover); transform:translateY(-2px); box-shadow:0 5px 20px rgba(66,184,131,0.3);}
.btn-confirm:disabled{ background:#95a5a6; cursor:not-allowed;}
</style>
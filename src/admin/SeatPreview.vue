<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>💺 Seat Preview</h1>
      <router-link to="/admin/shows" class="btn-back">← Back to Shows</router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading seats...
    </div>

    <div v-else class="seat-preview-container">
      <!-- Show Info -->
      <div class="show-info-card" v-if="showInfo.movieTitle">
        <h2>{{ showInfo.movieTitle }}</h2>
        <div class="info-details">
          <span v-if="showInfo.date">📅 {{ formatDate(showInfo.date) }}</span>
          <span v-if="showInfo.time">🕐 {{ showInfo.time }}</span>
          <span v-if="showInfo.price">💰 Rs. {{ showInfo.price }}</span>
          <span v-if="showInfo.theater">🎭 {{ showInfo.theater }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="seat-legend">
        <div class="legend-item">
          <div class="seat-icon available"></div>
          <span>Available</span>
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

      <!-- Seats Grid - EXACT MATCH TO SeatSelection.vue -->
      <div class="seats-container">
        <div v-for="row in seatRows" :key="row" class="seat-row">
          <div class="row-label">{{ row }}</div>

          <!-- Left Section (1-5) -->
          <div class="seats-section left-section">
            <div
              v-for="seat in getSeatsInRow(row).slice(0, 5)"
              :key="seat.id"
              :class="['seat', seat.isBooked ? 'booked' : 'available']"
            >
              {{ seat.seatNumber }}
            </div>
          </div>

          <!-- Center Section (6-10) -->
          <div class="seats-section center-section">
            <div
              v-for="seat in getSeatsInRow(row).slice(5, 10)"
              :key="seat.id"
              :class="['seat', seat.isBooked ? 'booked' : 'available']"
            >
              {{ seat.seatNumber }}
            </div>
          </div>

          <!-- Right Section (11-15) -->
          <div class="seats-section right-section">
            <div
              v-for="seat in getSeatsInRow(row).slice(10, 15)"
              :key="seat.id"
              :class="['seat', seat.isBooked ? 'booked' : 'available']"
            >
              {{ seat.seatNumber }}
            </div>
          </div>

          <div class="row-label">{{ row }}</div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-number">{{ seats.length }}</div>
          <div class="stat-label">Total Seats</div>
        </div>
        <div class="stat-item">
          <div class="stat-number available-color">{{ availableSeats }}</div>
          <div class="stat-label">Available</div>
        </div>
        <div class="stat-item">
          <div class="stat-number booked-color">{{ bookedSeats }}</div>
          <div class="stat-label">Booked</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ occupancyRate }}%</div>
          <div class="stat-label">Occupancy</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRoute } from "vue-router";

const route = useRoute();
const seats = ref([]);
const showInfo = ref({});
const loading = ref(true);

// Rows A-J (10 rows, matching SeatSelection.vue)
const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

// Get seats in a row, sorted by number
const getSeatsInRow = (row) => {
  return seats.value
    .filter(s => s.seatNumber.startsWith(row))
    .sort((a, b) => {
      const numA = parseInt(a.seatNumber.slice(1));
      const numB = parseInt(b.seatNumber.slice(1));
      return numA - numB;
    });
};

const fetchSeats = async () => {
  loading.value = true;
  try {
    const movieId = route.query.movieId;
    const showId = route.params.showId;
    
    if (!movieId || !showId) {
      throw new Error("Missing movieId or showId in URL parameters");
    }

    // Fetch show info
    const showRef = doc(db, "movies", movieId, "shows", showId);
    const showSnap = await getDoc(showRef);
    
    if (showSnap.exists()) {
      const showData = showSnap.data();
      
      // Fetch movie info
      const movieRef = doc(db, "movies", movieId);
      const movieSnap = await getDoc(movieRef);
      
      showInfo.value = {
        movieTitle: movieSnap.exists() ? movieSnap.data().title : "Unknown Movie",
        date: showData.date,
        time: showData.time,
        price: showData.price,
        theater: showData.theater
      };
    }

    // Fetch seats
    const seatsRef = collection(db, "movies", movieId, "shows", showId, "seats");
    const seatsSnap = await getDocs(seatsRef);

    if (seatsSnap.empty) {
      // Generate default seats matching SeatSelection.vue layout
      const defaultSeats = [];
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const seatsPerRow = 15; // 5 left + 5 center + 5 right
      
      rows.forEach(r => {
        for (let i = 1; i <= seatsPerRow; i++) {
          defaultSeats.push({ 
            id: `${r}${i}`, 
            seatNumber: `${r}${i}`, 
            isBooked: false 
          });
        }
      });
      seats.value = defaultSeats;
    } else {
      seats.value = seatsSnap.docs.map(doc => ({ 
        id: doc.id, 
        seatNumber: doc.data().seatNumber || doc.data().number || doc.id,
        isBooked: doc.data().isBooked || false
      }));
    }

    // Sort seats
    seats.value.sort((a, b) => {
      const rowA = a.seatNumber.charAt(0);
      const rowB = b.seatNumber.charAt(0);
      const colA = parseInt(a.seatNumber.slice(1));
      const colB = parseInt(b.seatNumber.slice(1));
      return rowA.localeCompare(rowB) || colA - colB;
    });
    
  } catch (err) {
    console.error("Error loading seats:", err);
    alert("Failed to load seats. Please check the URL parameters.");
  } finally {
    loading.value = false;
  }
};

// Calculate statistics
const availableSeats = computed(() => {
  return seats.value.filter(s => !s.isBooked).length;
});

const bookedSeats = computed(() => {
  return seats.value.filter(s => s.isBooked).length;
});

const occupancyRate = computed(() => {
  if (seats.value.length === 0) return 0;
  return Math.round((bookedSeats.value / seats.value.length) * 100);
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

onMounted(fetchSeats);
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: var(--card-bg);
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid var(--border-color);
  transition: all 0.3s;
}

.btn-back:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--text-color);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 184, 131, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.seat-preview-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Show Info Card */
.show-info-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.show-info-card h2 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.info-details {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: var(--text-color);
  opacity: 0.8;
}

/* Legend */
.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;
  color: var(--text-color);
}

.seat-icon {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  border: 2px solid var(--border-color);
}

.seat-icon.available {
  background: var(--card-bg);
}

.seat-icon.booked {
  background: #e74c3c;
  border-color: #e74c3c;
}

/* Screen */
.screen-container {
  text-align: center;
  margin-bottom: 1rem;
}

.screen {
  display: inline-block;
  padding: 0.5rem 3rem;
  background: linear-gradient(to bottom, #333, #111);
  color: white;
  border-radius: 10px 10px 50% 50%;
  font-weight: bold;
  letter-spacing: 2px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

/* Seats Container - EXACT MATCH TO SeatSelection.vue */
.seats-container {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.seat-row {
  display: grid;
  grid-template-columns: 30px 1fr 1fr 1fr 30px;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.row-label {
  font-weight: bold;
  text-align: center;
  color: var(--text-color);
  font-size: 1rem;
}

.seats-section {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.seat {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.seat.available {
  background: var(--card-bg);
  color: var(--text-color);
}

.seat.booked {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
  opacity: 0.7;
}

/* Statistics Card */
.stats-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.stat-number.available-color {
  color: var(--primary-color);
}

.stat-number.booked-color {
  color: #e74c3c;
}

.stat-label {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .seat-preview-container {
    gap: 1.5rem;
  }

  .seats-container {
    padding: 1rem;
    overflow-x: auto;
  }

  .seat-row {
    grid-template-columns: 25px 1fr 1fr 1fr 25px;
    gap: 0.3rem;
  }

  .seat {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .seats-section {
    gap: 0.3rem;
  }

  .stats-card {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  /* ===== ENHANCED MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .btn-back {
    width: 100%;
  }

  .seat-preview-container {
    gap: 1.5rem;
  }

  .show-info-card {
    padding: 1.2rem;
  }

  .show-info-card h2 {
    font-size: 1.3rem;
  }

  .info-details {
    gap: 1rem;
    font-size: 0.9rem;
  }

  .seat-legend {
    gap: 1rem;
    font-size: 0.85rem;
  }

  .screen {
    padding: 0.5rem 2rem;
    font-size: 0.9rem;
  }

  .seats-container {
    padding: 1rem;
    overflow-x: auto;
  }

  .seat-row {
    grid-template-columns: 25px 1fr 1fr 1fr 25px;
    gap: 0.25rem;
  }

  .row-label {
    font-size: 0.85rem;
  }

  .seat {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .stats-card {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 1.3rem;
  }

  .show-info-card {
    padding: 1rem;
  }

  .show-info-card h2 {
    font-size: 1.2rem;
  }

  .seat-row {
    grid-template-columns: 20px 1fr 1fr 1fr 20px;
    gap: 0.2rem;
  }

  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .stats-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }
}
}
</style>
<template>
  <div class="bookings-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>🎫 My Bookings</h1>
      <p>View and manage your movie bookings</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading your bookings...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookings.length === 0" class="no-results">
      <p>😔 No bookings yet!</p>
      <router-link to="/movies" class="btn-primary">Browse Movies</router-link>
    </div>

    <!-- Bookings Tickets -->
    <div v-else class="bookings-grid">
      <div v-for="booking in sortedBookings" :key="booking.id" class="booking-ticket">
        
        <!-- Left Section: Poster -->
        <div class="ticket-left">
          <img :src="booking.poster || '/default-poster.png'" :alt="booking.movieTitle"/>
          <span :class="['status-badge', booking.status]">{{ booking.status || 'confirmed' }}</span>
        </div>

        <!-- Right Section: Ticket Info -->
        <div class="ticket-right">
          <h3 class="movie-title">{{ booking.movieTitle || 'Movie' }}</h3>
          <p>📅 <strong>{{ booking.showDate }}</strong> at <strong>{{ booking.showTime }}</strong></p>
          <p>💺 Seats: <strong>{{ formatSeats(booking.seats) }}</strong></p>
          <p>💰 Total: <strong>Rs. {{ booking.totalPrice }}</strong></p>

          <div class="ticket-actions">
            <button @click="viewDetails(booking)" class="btn-secondary">Details</button>
            <button @click="downloadTicket(booking)" class="btn-download">📥 Ticket</button>
            <button v-if="canCancel(booking)" @click="cancelBooking(booking)" class="btn-danger">Cancel</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

const bookings = ref([]);
const loading = ref(true);

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const dateA = new Date(a.showDate + " " + a.showTime);
    const dateB = new Date(b.showDate + " " + b.showTime);
    return dateB - dateA;
  });
});

// Helper to format seats (handle both array and string)
const formatSeats = (seats) => {
  if (Array.isArray(seats)) {
    return seats.join(', ');
  }
  try {
    const parsed = JSON.parse(seats);
    return Array.isArray(parsed) ? parsed.join(', ') : seats;
  } catch {
    return seats;
  }
};

const fetchBookings = async () => {
  try {
    loading.value = true;
    const userId = auth.currentUser.uid;
    const bookingsCol = collection(db, "bookings");
    const q = query(bookingsCol, where("userId", "==", userId));
    const snap = await getDocs(q);

    const tempBookings = [];

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      let poster = '/default-poster.png';

      if (data.movieId) {
        const movieDoc = await getDoc(doc(db, "movies", data.movieId));
        if (movieDoc.exists()) poster = movieDoc.data().poster || poster;
      }

      // Handle seats properly - convert to array if needed
      let seatsArray = data.seats;
      if (typeof data.seats === 'string') {
        try {
          seatsArray = JSON.parse(data.seats);
        } catch {
          seatsArray = [data.seats];
        }
      }

      tempBookings.push({
        id: docSnap.id,
        poster,
        ...data,
        seats: seatsArray // Ensure it's always an array
      });
    }

    bookings.value = tempBookings;
  } catch (err) {
    console.error("Error fetching bookings:", err);
    alert("Failed to load bookings.");
  } finally {
    loading.value = false;
  }
};

const viewDetails = (booking) => {
  const seatsText = formatSeats(booking.seats);
  const details = `
Booking Details
━━━━━━━━━━━━━━
Movie: ${booking.movieTitle}
Date: ${booking.showDate}
Time: ${booking.showTime}
Seats: ${seatsText}
Total Price: Rs. ${booking.totalPrice}
Status: ${booking.status || 'confirmed'}
Payment Method: ${booking.paymentMethod || 'N/A'}
  `;
  alert(details);
};

const canCancel = (booking) => {
  const today = new Date();
  const showDate = new Date(booking.showDate + " " + booking.showTime);
  return showDate > today && booking.status !== "cancelled";
};

const cancelBooking = async (booking) => {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  
  try {
    // Update booking status
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "cancelled",
      cancelledAt: new Date().toISOString()
    });

    // Free up the seats
    if (booking.movieId && booking.showId) {
      const seatsRef = collection(db, "movies", booking.movieId, "shows", booking.showId, "seats");
      const seatsSnapshot = await getDocs(seatsRef);
      
      const seatsArray = Array.isArray(booking.seats) ? booking.seats : JSON.parse(booking.seats);
      
      const updatePromises = seatsSnapshot.docs
        .filter(seatDoc => seatsArray.includes(seatDoc.data().seatNumber))
        .map(seatDoc => updateDoc(doc(db, "movies", booking.movieId, "shows", booking.showId, "seats", seatDoc.id), {
          isBooked: false
        }));
      
      await Promise.all(updatePromises);
    }

    // Update local state
    const bookingIndex = bookings.value.findIndex(b => b.id === booking.id);
    if (bookingIndex !== -1) {
      bookings.value[bookingIndex].status = "cancelled";
    }

    alert("Booking cancelled successfully!");
  } catch (err) {
    console.error("Error cancelling booking:", err);
    alert("Failed to cancel booking.");
  }
};

const downloadTicket = async (booking) => {
  try {
    // Dynamically import the PDF generator
    const { downloadTicketAndInvoice } = await import('../utils/pdfGenerator.js');
    
    const result = await downloadTicketAndInvoice({
      id: booking.id,
      movieTitle: booking.movieTitle,
      showDate: booking.showDate,
      showTime: booking.showTime,
      seats: Array.isArray(booking.seats) ? booking.seats : JSON.parse(booking.seats),
      totalPrice: booking.totalPrice,
      paymentMethod: booking.paymentMethod || 'Card'
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("Error downloading ticket:", err);
    alert("Failed to download ticket. Please try again.");
  }
};

onMounted(fetchBookings);
</script>

<style scoped>
.bookings-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: var(--bg-color);
  font-family: 'Poppins', sans-serif;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text-color);
}

.page-header p {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 1.1rem;
}

/* Loading / Empty */
.loading, .no-results {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66,184,131,0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

/* Bookings Tickets */
.bookings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.booking-ticket {
  display: flex;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  position: relative;
  border: 2px dashed #ccc;
}

.booking-ticket::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 33%;
  width: 2px;
  border-left: 2px dashed #ccc;
}

.ticket-left {
  width: 33%;
  position: relative;
  overflow: hidden;
}

.ticket-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  z-index: 2;
}

.status-badge.confirmed { background: #2ecc71; }
.status-badge.pending { background: #f39c12; }
.status-badge.cancelled { background: #e74c3c; }

.ticket-right {
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.movie-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.ticket-right p {
  font-size: 0.9rem;
  margin: 0.25rem 0;
  color: var(--text-color);
}

.ticket-right strong { color: var(--primary-color); }

.ticket-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-secondary, .btn-danger, .btn-download {
  padding: 0.35rem 0.8rem;
  font-size: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}
.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
}

.btn-download {
  background: var(--primary-color);
  color: white;
}
.btn-download:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-danger {
  background: #e74c3c;
  color: white;
}
.btn-danger:hover { background: #c0392b; }

/* Mobile */
@media (max-width: 700px) {
  .booking-ticket {
    flex-direction: column;
  }
  .ticket-left, .ticket-right {
    width: 100%;
  }
  .booking-ticket::after { display: none; }
}
</style>
<template>
  <div class="admin-page">
    <h1>🎫 All Bookings</h1>
    <p class="subtitle">Manage all user bookings</p>

    <div v-if="loading" class="loading">
      Loading bookings...
    </div>

    <div v-else-if="bookings.length === 0" class="empty">
      No bookings found
    </div>

    <table v-else class="bookings-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Movie</th>
          <th>Date</th>
          <th>Time</th>
          <th>Seats</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
  <tr v-for="booking in bookings" :key="booking.id">
    <td data-label="User">{{ booking.userEmail || '—' }}</td>
    <td data-label="Movie">{{ booking.movieTitle || '—' }}</td>
    <td data-label="Date">{{ booking.showDate }}</td>
    <td data-label="Time">{{ booking.showTime }}</td>
    <td data-label="Seats">{{ booking.seats?.join(', ') }}</td>
    <td data-label="Total">Rs. {{ booking.totalPrice }}</td>
    <td data-label="Status">
      <span :class="['status', booking.status]">
        {{ booking.status || 'confirmed' }}
      </span>
    </td>
  </tr>
</tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const bookings = ref([]);
const loading = ref(true);

const fetchBookings = async () => {
  try {
    const snap = await getDocs(collection(db, "bookings"));
    bookings.value = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Error loading bookings", e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBookings);
</script>

<style scoped>
.admin-page {
  padding: 2rem;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 1rem;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
}

.bookings-table th,
.bookings-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status.confirmed {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status.cancelled {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-page h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  /* Convert table to cards on mobile */
  .bookings-table {
    display: block;
    overflow-x: auto;
  }

  .bookings-table thead {
    display: none;
  }

  .bookings-table tbody {
    display: block;
  }

  .bookings-table tr {
    display: block;
    margin-bottom: 1rem;
    background: var(--card-bg);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow);
  }

  .bookings-table td {
    display: block;
    text-align: left;
    padding: 0.5rem 0;
    border: none;
  }

  .bookings-table td::before {
    content: attr(data-label);
    font-weight: bold;
    display: inline-block;
    width: 100px;
    color: var(--text-color);
    opacity: 0.7;
  }

  .status {
    display: inline-block;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .admin-page h1 {
    font-size: 1.3rem;
  }

  .bookings-table tr {
    padding: 0.75rem;
  }
}
</style>

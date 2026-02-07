<template>
  <div class="admin-dashboard">
    <h1>🎬 Theatre Admin Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h2>{{ totalMovies }}</h2>
        <p>Movies</p>
        <router-link to="/admin/movies" class="btn-primary">Manage Movies</router-link>
      </div>
      <div class="stat-card">
        <h2>{{ totalShows }}</h2>
        <p>Shows</p>
        <router-link to="/admin/shows" class="btn-primary">Manage Shows</router-link>
      </div>
      <div class="stat-card">
        <h2>{{ totalBookings }}</h2>
        <p>Bookings</p>
        <router-link to="/admin/bookings" class="btn-primary">View Bookings</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const totalMovies = ref(0);
const totalShows = ref(0);
const totalBookings = ref(0);

const loadStats = async () => {
  const moviesSnap = await getDocs(collection(db, "movies"));
  totalMovies.value = moviesSnap.size;

  let shows = 0;
  for (const m of moviesSnap.docs) {
    const showsSnap = await getDocs(collection(db, "movies", m.id, "shows"));
    shows += showsSnap.size;
  }
  totalShows.value = shows;

  const bookingsSnap = await getDocs(collection(db, "bookings"));
  totalBookings.value = bookingsSnap.size;
};

onMounted(loadStats);
</script>

<style scoped>
.admin-dashboard h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-card h2 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-card p {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-dashboard h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-card h2 {
    font-size: 1.8rem;
  }

  .btn-primary {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    display: block;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-dashboard h1 {
    font-size: 1.3rem;
  }

  .stat-card {
    padding: 1.2rem;
  }

  .stat-card h2 {
    font-size: 1.5rem;
  }

  .stat-card p {
    font-size: 0.9rem;
  }
}
</style>

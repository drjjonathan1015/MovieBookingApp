<template>
  <div class="movie-details-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/movies" class="btn-primary">← Back to Movies</router-link>
    </div>

    <div v-else class="movie-details">
      <!-- Movie Hero Section -->
      <div class="movie-hero">
        <img :src="movie.poster" :alt="movie.title" class="backdrop" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <router-link to="/movies" class="back-button">
            ← Back
          </router-link>
        </div>
      </div>

      <!-- Movie Info Section -->
      <div class="movie-info-section">
        <div class="movie-poster-container">
          <img :src="movie.poster" :alt="movie.title" class="movie-poster" />
        </div>

        <div class="movie-info">
          <h1>{{ movie.title }}</h1>
          
          <div class="movie-meta">
            <span v-if="movie.rating" class="rating">
              ⭐ {{ movie.rating }}/10
            </span>
            <span>{{ movie.language }}</span>
            <span>{{ movie.duration }}</span>
            <span v-if="movie.genre" class="genre-badge">
              {{ movie.genre }}
            </span>
          </div>

          <p class="description">{{ movie.description || 'No description available.' }}</p>

          <!-- Show Times -->
          <div class="showtimes-section">
            <h3>📅 Select Show Time</h3>
            
            <div v-if="loadingShows" class="loading-shows">
              Loading available shows...
            </div>

            <div v-else-if="shows.length === 0" class="no-shows">
              <p>No shows available for this movie.</p>
            </div>

            <div v-else class="showtimes-grid">
              <button
                v-for="show in shows"
                :key="show.id"
                @click="selectShow(show.id)"
                :class="['show-card', { selected: selectedShow === show.id }]"
              >
                <div class="show-date">{{ formatDate(show.date) }}</div>
                <div class="show-time">🕐 {{ show.time }}</div>
                <div class="show-price">Rs. {{ show.price }}</div>
                <div v-if="show.theater" class="show-theater">
                  {{ show.theater }}
                </div>
              </button>
            </div>

            <router-link
              v-if="selectedShow"
              :to="`/seats/${selectedShow}?movieId=${movieId}`"
              class="book-button"
            >
              🎟️ Book Seats
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const route = useRoute();
const router = useRouter();
const movieId = route.params.id;

const movie = ref({});
const shows = ref([]);
const selectedShow = ref(null);
const loading = ref(true);
const loadingShows = ref(true);
const error = ref(null);

const fetchMovie = async () => {
  try {
    const movieDoc = await getDoc(doc(db, "movies", movieId));
    if (movieDoc.exists()) {
      movie.value = { id: movieDoc.id, ...movieDoc.data() };
    } else {
      error.value = "Movie not found";
    }
  } catch (err) {
    console.error("Error fetching movie:", err);
    error.value = "Failed to load movie details";
  } finally {
    loading.value = false;
  }
};

const fetchShows = async () => {
  try {
    loadingShows.value = true;
    const showsRef = collection(db, "movies", movieId, "shows");
    const snap = await getDocs(showsRef);

    shows.value = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
    });
  } catch (err) {
    console.error("Error fetching shows:", err);
  } finally {
    loadingShows.value = false;
  }
};

const selectShow = (id) => {
  selectedShow.value = id;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
};

onMounted(() => {
  fetchMovie();
  fetchShows();
});
</script>

<style scoped>
.movie-details-page {
  min-height: calc(100vh - 200px);
  background: var(--bg-color);
}

.loading,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
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

.movie-hero {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.backdrop {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(8px);
  transform: scale(1.1);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0,0,0,0.3) 0%, 
    var(--bg-color) 100%
  );
}

.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  padding: 2rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.movie-info-section {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: -100px auto 0;
  position: relative;
  z-index: 1;
}

.movie-poster-container {
  flex-shrink: 0;
}

.movie-poster {
  width: 300px;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.movie-info {
  flex: 1;
}

.movie-info h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.movie-meta > span {
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border-radius: 20px;
  color: var(--text-color);
  box-shadow: var(--shadow);
}

.rating {
  background: rgba(255, 193, 7, 0.2) !important;
  color: #ffc107 !important;
  font-weight: 600;
}

.genre-badge {
  background: rgba(66, 184, 131, 0.2) !important;
  color: var(--primary-color) !important;
  font-weight: 600;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 2rem;
}

.showtimes-section {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: var(--shadow);
}

.showtimes-section h3 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.loading-shows,
.no-shows {
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  opacity: 0.7;
}

.showtimes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.show-card {
  padding: 1.5rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.show-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.show-card.selected {
  border-color: var(--primary-color);
  background: rgba(66, 184, 131, 0.1);
}

.show-date {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.show-time {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.show-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.show-theater {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}

.book-button {
  display: block;
  width: 100%;
  padding: 1.25rem;
  background: var(--primary-color);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.book-button:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(66, 184, 131, 0.3);
}

.btn-primary {
  padding: 1rem 2rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}

@media (max-width: 768px) {
  .movie-info-section {
    flex-direction: column;
    margin-top: -50px;
  }

  .movie-poster {
    width: 200px;
    margin: 0 auto;
  }

  .movie-info h1 {
    font-size: 1.8rem;
  }

  .showtimes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
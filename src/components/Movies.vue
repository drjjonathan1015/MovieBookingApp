<template>
  <div class="movies-page">
    <div class="page-header">
      <h1>🎬 Now Showing</h1>
      <p>Browse all currently showing movies</p>
    </div>

    <!-- Search and Filters -->
    <div class="controls">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="🔍 Search movies..." 
        class="search-input"
      />
      
      <div class="filters">
        <select v-model="selectedGenre" class="filter-select">
          <option value="">All Genres</option>
          <option v-for="genre in genres" :key="genre" :value="genre">
            {{ genre }}
          </option>
        </select>

        <select v-model="selectedLanguage" class="filter-select">
          <option value="">All Languages</option>
          <option v-for="lang in languages" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="title">Sort by Title</option>
          <option value="rating">Sort by Rating</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading movies...</p>
    </div>

    <!-- No Results -->
    <div v-else-if="filteredMovies.length === 0" class="no-results">
      <p>😔 No movies found matching your criteria</p>
      <button @click="clearFilters" class="btn-primary">Clear Filters</button>
    </div>

    <!-- Movies Grid -->
    <div v-else class="movies-grid">
      <div 
        v-for="movie in filteredMovies" 
        :key="movie.id" 
        class="movie-card"
        @click="goToMovie(movie.id)"
      >
        <div class="movie-poster">
          <img :src="movie.poster" :alt="movie.title" />
          <div class="movie-overlay">
            <button class="btn-view">View Details</button>
          </div>
          <span v-if="movie.rating" class="rating-badge">
            ⭐ {{ movie.rating }}
          </span>
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <p class="movie-meta">
            <span>{{ movie.language }}</span>
            <span>•</span>
            <span>{{ movie.duration }}</span>
          </p>
          <p v-if="movie.genre" class="movie-genre">{{ movie.genre }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const router = useRouter();

const movies = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedGenre = ref("");
const selectedLanguage = ref("");
const sortBy = ref("title");

const genres = computed(() => {
  const allGenres = movies.value.map(m => m.genre).filter(Boolean);
  return [...new Set(allGenres)].sort();
});

const languages = computed(() => {
  const allLanguages = movies.value.map(m => m.language).filter(Boolean);
  return [...new Set(allLanguages)].sort();
});

const filteredMovies = computed(() => {
  let filtered = movies.value;

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(m => 
      m.title?.toLowerCase().includes(query) ||
      m.genre?.toLowerCase().includes(query)
    );
  }

  // Genre filter
  if (selectedGenre.value) {
    filtered = filtered.filter(m => m.genre === selectedGenre.value);
  }

  // Language filter
  if (selectedLanguage.value) {
    filtered = filtered.filter(m => m.language === selectedLanguage.value);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "duration":
        return parseDuration(a.duration) - parseDuration(b.duration);
      default:
        return 0;
    }
  });

  return filtered;
});

const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
};

const fetchMovies = async () => {
  try {
    loading.value = true;
    const moviesCol = collection(db, "movies");
    const q = query(moviesCol, where("status", "==", "now showing"));
    const moviesSnapshot = await getDocs(q);
    movies.value = moviesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    alert("Failed to load movies. Please refresh the page.");
  } finally {
    loading.value = false;
  }
};

const goToMovie = (movieId) => {
  router.push(`/movies/${movieId}`);
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedGenre.value = "";
  selectedLanguage.value = "";
  sortBy.value = "title";
};

onMounted(() => {
  fetchMovies();
});
</script>

<style scoped>
.movies-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: var(--bg-color);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 1.1rem;
}

.controls {
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.search-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 184, 131, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 4rem;
}

.no-results p {
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 10px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow);
}

.movie-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.movie-poster {
  position: relative;
  overflow: hidden;
  padding-top: 150%;
}

.movie-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.1);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.btn-view {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.rating-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.3rem 0.8rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 5px;
}

.movie-info {
  padding: 1rem;
}

.movie-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-meta {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.movie-genre {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
}

@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }
}
</style>
<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <h1>🎬 Movies</h1>
      <router-link to="/admin/movies/add" class="btn-primary">
        + Add Movie
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading movies...
    </div>

    <!-- Empty State -->
    <div v-else-if="movies.length === 0" class="empty-state">
      <p>No movies found. Add your first movie!</p>
      <router-link to="/admin/movies/add" class="btn-primary">
        + Add Movie
      </router-link>
    </div>

    <!-- Movies Grid -->
    <div v-else class="movies-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        
        <!-- Poster -->
        <div class="movie-poster">
          <img :src="movie.poster" :alt="movie.title" />
          <div class="status-badge" :class="movie.status">
            {{ movie.status }}
          </div>
        </div>

        <!-- Info -->
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <div class="movie-meta">
            <span>{{ movie.language }}</span>
            <span>{{ movie.duration }}</span>
          </div>
          <p v-if="movie.genre" class="genre">{{ movie.genre }}</p>

          <div class="actions">
            <router-link
              :to="`/admin/movies/edit/${movie.id}`"
              class="btn-edit"
            >
              ✏️ Edit
            </router-link>
            <button @click="deleteMovie(movie)" class="btn-delete">
              🗑️ Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

const movies = ref([]);
const loading = ref(true);

const fetchMovies = async () => {
  try {
    loading.value = true;
    const snap = await getDocs(collection(db, "movies"));
    movies.value = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    alert("Failed to load movies");
  } finally {
    loading.value = false;
  }
};

const deleteMovie = async (movie) => {
  if (!confirm(`Delete "${movie.title}"? This will also delete all its shows and seats.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, "movies", movie.id));
    alert("✅ Movie deleted successfully!");
    await fetchMovies(); // Refresh the list
  } catch (error) {
    console.error("Error deleting movie:", error);
    alert("Failed to delete movie");
  }
};

onMounted(fetchMovies);
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-color);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-color);
}

/* Buttons */
.btn-primary {
  padding: 0.7rem 1.4rem;
  background: var(--primary-color);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

/* Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.8rem;
}

/* Card */
.movie-card {
  background: var(--card-bg);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.25);
}

/* Poster */
.movie-poster {
  position: relative;
  padding-top: 150%;
  background: #000;
}

.movie-poster img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.now.showing {
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.status-badge.coming.soon {
  background: rgba(52, 152, 219, 0.9);
  color: white;
}

/* Info */
.movie-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.movie-info h3 {
  font-size: 1.05rem;
  color: var(--text-color);
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.movie-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.7;
  flex-wrap: wrap;
}

.movie-meta span {
  background: var(--bg-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.genre {
  font-size: 0.85rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 500;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

/* Mobile */
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

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
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

  .btn-primary {
    width: 100%;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .movie-card {
    border-radius: 10px;
  }

  .movie-info {
    padding: 0.75rem;
  }

  .movie-info h3 {
    font-size: 0.95rem;
  }

  .movie-meta span {
    font-size: 0.8rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.4rem;
  }

  .btn-edit,
  .btn-delete {
    width: 100%;
    font-size: 0.85rem;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 1.3rem;
  }

  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .movie-info h3 {
    font-size: 0.9rem;
  }
}
</style>
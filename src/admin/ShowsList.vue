<template>
  <div class="movies-page">
    <div class="page-header">
      <h1>Shows</h1>
      <router-link to="/admin/shows/add" class="btn-primary">+ Add Show</router-link>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading shows...</p>
    </div>

    <div v-else-if="shows.length === 0" class="no-results">
      <p>No shows found. Add your first show!</p>
      <router-link to="/admin/shows/add" class="btn-primary">+ Add Show</router-link>
    </div>

    <div class="shows-grid" v-else>
      <div v-for="show in shows" :key="`${show.movieId}-${show.id}`" class="show-card">
        <div class="show-info">
          <h3>{{ show.movieTitle }}</h3>
          <div class="show-details">
            <span class="detail-item">📅 {{ formatDate(show.date) }}</span>
            <span class="detail-item">🕐 {{ show.time }}</span>
            <span class="detail-item price">Rs. {{ show.price }}</span>
            <span v-if="show.theater" class="detail-item">🎭 {{ show.theater }}</span>
          </div>
          
          <div class="card-actions">
            <!-- FIXED: Now passing both movieId and showId -->
            <router-link 
              :to="`/admin/shows/edit/${show.movieId}/${show.id}`" 
              class="btn-edit"
            >
              ✏️ Edit
            </router-link>
            <router-link 
              :to="`/admin/seat-preview/${show.id}?movieId=${show.movieId}`" 
              class="btn-view"
            >
              💺 View Seats
            </router-link>
            <button @click="deleteShow(show)" class="btn-delete">
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

const shows = ref([]);
const loading = ref(true);

const fetchShows = async () => {
  loading.value = true;

  try {
    const moviesSnap = await getDocs(collection(db, "movies"));
    const tempShows = [];

    for (const movieDoc of moviesSnap.docs) {
      const movieId = movieDoc.id;
      const movieData = movieDoc.data();
      
      const showsSnap = await getDocs(collection(db, "movies", movieId, "shows"));
      
      showsSnap.docs.forEach(showDoc => {
        const showData = showDoc.data();
        tempShows.push({
          id: showDoc.id,
          movieId: movieId,
          movieTitle: movieData.title || "Untitled Movie",
          date: showData.date,
          time: showData.time,
          price: showData.price,
          theater: showData.theater || null
        });
      });
    }

    // Sort by date and time (most recent first)
    tempShows.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return dateTimeA - dateTimeB;
    });

    shows.value = tempShows;
  } catch (err) {
    console.error("Error fetching shows:", err);
    alert("Failed to load shows");
    shows.value = [];
  } finally {
    loading.value = false;
  }
};

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

const deleteShow = async (show) => {
  if (!confirm(`Delete show for "${show.movieTitle}" on ${formatDate(show.date)} at ${show.time}?`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, "movies", show.movieId, "shows", show.id));
    alert("✅ Show deleted successfully!");
    fetchShows(); // Refresh the list
  } catch (error) {
    console.error("Error deleting show:", error);
    alert("Failed to delete show");
  }
};

onMounted(fetchShows);
</script>

<style scoped>
.movies-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: var(--bg-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text-color);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.loading,
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
}

.no-results p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
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
  to {
    transform: rotate(360deg);
  }
}

.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.show-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: var(--shadow);
  transition: transform 0.3s, box-shadow 0.3s;
}

.show-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.show-info h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-weight: 600;
}

.show-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 8px;
}

.detail-item {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.9;
}

.detail-item.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-edit,
.btn-view,
.btn-delete {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  text-align: center;
  min-width: 80px;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-view {
  background: #3498db;
  color: white;
}

.btn-view:hover {
  background: #2980b9;
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

@media (max-width: 768px) {
  .shows-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn-edit,
  .btn-view,
  .btn-delete {
    width: 100%;
  }

  /* ===== ENHANCED MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .movies-page {
    padding: 1rem;
  }

  .shows-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .btn-primary {
    width: 100%;
  }

  .show-card {
    padding: 1.2rem;
  }

  .show-info h3 {
    font-size: 1.2rem;
  }

  .show-details {
    gap: 0.4rem;
  }

  .detail-item {
    font-size: 0.9rem;
  }

  .card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-edit,
  .btn-view,
  .btn-delete {
    width: 100%;
    padding: 0.6rem 1rem;
  }
}

@media (max-width: 480px) {
  .movies-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 1.3rem;
  }

  .show-card {
    padding: 1rem;
  }

  .show-info h3 {
    font-size: 1.1rem;
  }

  .detail-item {
    font-size: 0.85rem;
  }
}
}
</style>
<template>
  <div class="admin-page">
    <h1>+ Add Show</h1>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading movies...</p>
    </div>

    <form v-else @submit.prevent="addShow" class="form-card">
      <label>
        Select Movie
        <select v-model="selectedMovieId" required>
          <option value="">-- Choose a movie --</option>
          <option v-for="movie in movies" :key="movie.id" :value="movie.id">
            {{ movie.title }}
          </option>
        </select>
      </label>

      <label>
        Date
        <input type="date" v-model="date" :min="today" required />
      </label>

      <label>
        Time
        <input type="time" v-model="time" required />
      </label>

      <label>
        Price (Rs. )
        <input type="number" v-model.number="price" min="0" step="50" placeholder="500" required />
      </label>

      <label>
        Theater/Screen (optional)
        <input type="text" v-model="theater" placeholder="Screen 1" />
      </label>

      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="isSubmitting || !selectedMovieId">
          {{ isSubmitting ? 'Adding...' : 'Add Show' }}
        </button>
        <button class="btn-secondary" type="button" @click="router.push('/admin/shows')">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const router = useRouter();

const movies = ref([]);
const selectedMovieId = ref("");
const date = ref("");
const time = ref("");
const price = ref(500);
const theater = ref("Screen 1");
const loading = ref(true);
const isSubmitting = ref(false);

// Get today's date in YYYY-MM-DD format for min date
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

const fetchMovies = async () => {
  try {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, "movies"));
    movies.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    alert("Failed to load movies");
  } finally {
    loading.value = false;
  }
};

const addShow = async () => {
  if (!selectedMovieId.value) {
    alert("Please select a movie");
    return;
  }

  try {
    isSubmitting.value = true;

    const showData = {
      date: date.value,
      time: time.value,
      price: price.value,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add optional theater field
    if (theater.value) showData.theater = theater.value;

    await addDoc(
      collection(db, "movies", selectedMovieId.value, "shows"),
      showData
    );

    alert("✅ Show added successfully!");
    router.push("/admin/shows");
  } catch (err) {
    console.error("Error adding show:", err);
    alert("Failed to add show. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchMovies);
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-page h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.form-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: var(--shadow);
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 0.875rem 1.5rem;
  background: transparent;
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-secondary:hover {
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

.loading p {
  font-size: 1.1rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary {
    order: 2;
  }
}

/* ===== ENHANCED MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-page h1 {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 1.5rem 1rem;
  }

  .form-card label {
    font-size: 0.9rem;
  }

  input,
  textarea,
  select {
    font-size: 0.95rem;
    padding: 0.7rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 0.875rem 1.25rem;
  }

  .btn-secondary {
    order: 2;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .admin-page h1 {
    font-size: 1.3rem;
  }

  .form-card {
    padding: 1.2rem 0.75rem;
  }

  .form-card label {
    font-size: 0.85rem;
  }

  input,
  textarea,
  select {
    font-size: 0.9rem;
    padding: 0.65rem;
  }
}
</style>
<template>
  <div class="admin-page">
    <h1>Edit Movie</h1>

    <form v-if="movie" @submit.prevent="updateMovie" class="form-card">
      <label>
        Title
        <input v-model="movie.title" type="text" required />
      </label>

      <label>
        Description
        <textarea v-model="movie.description" required></textarea>
      </label>

      <label>
        Duration
        <input v-model="movie.duration" type="text" placeholder="2h 30m" required />
      </label>

      <label>
        Language
        <input v-model="movie.language" type="text" required />
      </label>

      <label>
        Genre (optional)
        <input v-model="movie.genre" type="text" placeholder="Action, Drama, etc." />
      </label>

      <label>
        Rating (optional)
        <input v-model.number="movie.rating" type="number" step="0.1" min="0" max="10" placeholder="7.5" />
      </label>

      <label>
        Poster URL
        <input v-model="movie.poster" type="url" required />
      </label>

      <label>
        Status
        <select v-model="movie.status" required>
          <option value="now showing">Now Showing</option>
          <option value="coming soon">Coming Soon</option>
        </select>
      </label>

      <div class="form-actions">
        <button class="btn-primary" type="submit">Update Movie</button>
        <button class="btn-secondary" type="button" @click="router.push('/admin/movies')">
          Cancel
        </button>
      </div>
    </form>

    <div v-else class="loading">
      <div class="spinner"></div>
      <p>Loading movie...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const movie = ref(null);

const fetchMovie = async () => {
  try {
    const docRef = doc(db, "movies", route.params.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      movie.value = docSnap.data();
    } else {
      alert("Movie not found");
      router.push("/admin/movies");
    }
  } catch (error) {
    console.error("Error fetching movie:", error);
    alert("Failed to load movie");
    router.push("/admin/movies");
  }
};

const updateMovie = async () => {
  const docRef = doc(db, "movies", route.params.id);
  try {
    await updateDoc(docRef, {
      ...movie.value,
      updatedAt: new Date()
    });
    alert("✅ Movie updated successfully!");
    router.push("/admin/movies");
  } catch (err) {
    console.error("Update error:", err);
    alert("Failed to update movie.");
  }
};

onMounted(fetchMovie);
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

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
}

textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
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

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
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
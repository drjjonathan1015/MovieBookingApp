<template>
  <div class="admin-page">
    <h1>+ Add Movie</h1>

    <form @submit.prevent="addMovie" class="form-card">
      <label>
        Title
        <input v-model="title" type="text" placeholder="Movie Title" required />
      </label>

      <label>
        Description
        <textarea v-model="description" placeholder="Brief description of the movie" required></textarea>
      </label>

      <label>
        Duration
        <input v-model="duration" type="text" placeholder="2h 30m" required />
      </label>

      <label>
        Language
        <input v-model="language" type="text" placeholder="English" required />
      </label>

      <label>
        Genre (optional)
        <input v-model="genre" type="text" placeholder="Action, Drama, Comedy, etc." />
      </label>

      <label>
        Rating (optional)
        <input v-model.number="rating" type="number" step="0.1" min="0" max="10" placeholder="7.5" />
      </label>

      <label>
        Poster URL
        <input v-model="poster" type="url" placeholder="https://example.com/poster.jpg" required />
      </label>

      <label>
        Status
        <select v-model="status" required>
          <option value="now showing">Now Showing</option>
          <option value="coming soon">Coming Soon</option>
        </select>
      </label>

      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Adding...' : 'Add Movie' }}
        </button>
        <button class="btn-secondary" type="button" @click="router.push('/admin/movies')">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const router = useRouter();

const title = ref("");
const description = ref("");
const duration = ref("");
const language = ref("");
const genre = ref("");
const rating = ref(null);
const poster = ref("");
const status = ref("now showing");
const isSubmitting = ref(false);

const addMovie = async () => {
  try {
    isSubmitting.value = true;
    
    const movieData = {
      title: title.value,
      description: description.value,
      duration: duration.value,
      language: language.value,
      poster: poster.value,
      status: status.value,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add optional fields only if they have values
    if (genre.value) movieData.genre = genre.value;
    if (rating.value) movieData.rating = rating.value;

    await addDoc(collection(db, "movies"), movieData);
    
    alert("✅ Movie added successfully!");
    router.push("/admin/movies");
  } catch (err) {
    console.error("Error adding movie:", err);
    alert("Failed to add movie. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
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
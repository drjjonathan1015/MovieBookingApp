<template>
  <div class="admin-page">
    <h1>Edit Show</h1>

    <form v-if="show" @submit.prevent="updateShow" class="form-card">
      <label>
        Date
        <input type="date" v-model="show.date" required />
      </label>

      <label>
        Time
        <input type="time" v-model="show.time" required />
      </label>

      <label>
        Price (Rs. )
        <input type="number" v-model.number="show.price" min="0" step="50" required />
      </label>

      <label>
        Theater/Screen (optional)
        <input type="text" v-model="show.theater" placeholder="Screen 1" />
      </label>

      <div class="form-actions">
        <button class="btn-primary" type="submit">Update Show</button>
        <button class="btn-secondary" type="button" @click="router.push('/admin/shows')">
          Cancel
        </button>
      </div>
    </form>

    <div v-else class="loading">
      <div class="spinner"></div>
      <p>Loading show...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const route = useRoute();
const router = useRouter();
const show = ref(null);

const fetchShow = async () => {
  try {
    const { movieId, id: showId } = route.params;

    if (!movieId || !showId) {
      alert("Invalid route parameters");
      router.push("/admin/shows");
      return;
    }

    const showRef = doc(db, "movies", movieId, "shows", showId);
    const snap = await getDoc(showRef);

    if (!snap.exists()) {
      alert("Show not found");
      router.push("/admin/shows");
      return;
    }

    const data = snap.data();

    // 🛡️ SAFETY CHECK
    if (!data.date || !data.time || data.price === undefined) {
      alert("⚠️ Show data is corrupted. Please recreate the show.");
      router.push("/admin/shows");
      return;
    }

    show.value = {
      date: data.date,
      time: data.time,
      price: data.price,
      theater: data.theater || ""
    };
  } catch (err) {
    console.error("Fetch show error:", err);
    alert("Failed to load show");
    router.push("/admin/shows");
  }
};

const updateShow = async () => {
  try {
    const { movieId, id: showId } = route.params;

    const showRef = doc(db, "movies", movieId, "shows", showId);

    await updateDoc(showRef, {
      date: show.value.date,
      time: show.value.time,
      price: show.value.price,
      theater: show.value.theater,
      updatedAt: new Date()
    });

    alert("✅ Show updated successfully");
    router.push("/admin/shows");
  } catch (err) {
    console.error("Update error:", err);
    alert("Failed to update show");
  }
};

onMounted(fetchShow);
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
  min-height: 80px;
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
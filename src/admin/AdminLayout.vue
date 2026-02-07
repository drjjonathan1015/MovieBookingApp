<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h2>🎟️ Admin Panel</h2>
      <router-link to="/admin/dashboard" class="nav-link">Dashboard</router-link>
      <router-link to="/admin/movies" class="nav-link">Movies</router-link>
      <router-link to="/admin/shows" class="nav-link">Shows</router-link>
      <router-link to="/admin/bookings" class="nav-link">Bookings</router-link>
      <router-link to="/admin/users" class="nav-link">Users</router-link>
    </aside>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}

.sidebar {
  width: 250px;
  background: var(--card-bg);
  padding: 2rem 1rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar h2 {
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.nav-link {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: background 0.2s;
}

.nav-link:hover {
  background: var(--primary-color);
  color: white;
}

.admin-content {
  flex: 1;
  padding: 2rem;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .nav-link {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .admin-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 0.75rem;
  }

  .sidebar h2 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .nav-link {
    padding: 0.5rem 0.7rem;
    font-size: 0.85rem;
  }

  .admin-content {
    padding: 0.75rem;
  }
}
</style>

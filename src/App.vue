<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">🎬 CinemaX</router-link>
      </div>

      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/movies">Now Showing</router-link>

        <!-- Logged-in users -->
        <router-link v-if="user" to="/my-bookings">My Bookings</router-link>
        <router-link v-if="user" to="/profile">Profile</router-link>
        <router-link v-if="isAdmin" to="/admin/dashboard">Admin Panel</router-link>

        <!-- Guests -->
        <router-link v-if="!user" to="/login" class="login-link">Login</router-link>
        <router-link v-if="!user" to="/register" class="register-link">Register</router-link>

        <!-- Theme toggle -->
        <button @click="toggleTheme" class="theme-toggle">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>

        <!-- User menu -->
        <div v-if="user" class="user-menu">
          <button class="user-avatar" @click="showUserMenu = !showUserMenu">
            {{ user.email?.[0]?.toUpperCase() || 'U' }}
          </button>
          <div v-if="showUserMenu" class="dropdown-menu">
            <div class="user-info">
              <p class="user-email">{{ user.email }}</p>
            </div>
            <router-link to="/profile" @click="showUserMenu = false">👤 Profile</router-link>
            <router-link to="/my-bookings" @click="showUserMenu = false">🎫 My Bookings</router-link>
            <button @click="logout" class="logout-btn">🚪 Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Page content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>🎬 CinemaX</h3>
          <p>Your ultimate movie booking experience</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <router-link to="/">Home</router-link>
          <router-link to="/movies">Movies</router-link>
          <a href="#about">About Us</a>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p>📧 info@cinemax.com</p>
          <p>📞 +94 123 456 789</p>
        </div>
        <div class="footer-section">
          <h4>Follow Us</h4>
          <div class="social-links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 CinemaX. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "vue-router";

const user = ref(null);
const isAdmin = ref(false);
const loading = ref(true);
const showUserMenu = ref(false);
const isDarkMode = ref(false);
const router = useRouter();

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  isDarkMode.value = savedTheme === "dark";
  applyTheme();

  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;
    isAdmin.value = false;
    if (currentUser) {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists() && snap.data().role === "admin") isAdmin.value = true;
    }
    loading.value = false;
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) showUserMenu.value = false;
  });
});

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
  applyTheme();
};

const applyTheme = () => {
  document.documentElement.setAttribute("data-theme", isDarkMode.value ? "dark" : "light");
};

const logout = async () => {
  await signOut(auth);
  user.value = null;
  isAdmin.value = false;
  router.push("/");
};

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("✅ PWA install available");
});


</script>

<style>
/* Global Styles */
:root {
  --primary-color: #42b883;
  --primary-hover: #369a6f;
  --bg-color: #ffffff;
  --text-color: #2c3e50;
  --navbar-bg: #111;
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --navbar-bg: #000;
  --card-bg: #2a2a2a;
  --border-color: #404040;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* Rest of your styles unchanged (navbar, footer, spinner, etc.) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar Styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--navbar-bg);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

.login-link {
  border: 1px solid white;
}

.register-link {
  background: var(--primary-color);
}

.register-link:hover {
  background: var(--primary-hover);
}

.theme-toggle {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: transform 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.2);
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: 2px solid white;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: transform 0.3s;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  min-width: 200px;
  overflow: hidden;
}

.user-info {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-color);
  word-break: break-all;
}

.dropdown-menu a,
.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background: rgba(66, 184, 131, 0.1);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Footer */
.footer {
  margin-top: auto;
  background: var(--navbar-bg);
  color: white;
  padding: 2rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
}

.footer-section a {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--primary-color);
}

.social-links {
  display: flex;
  gap: 1rem;
  font-size: 1.5rem;
}

.footer-bottom {
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
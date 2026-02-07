<template>
  <div class="not-found-page">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2>🎬 Oops! This page took an intermission</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      
      <div class="suggestions">
        <h3>Here's what you can do:</h3>
        <ul>
          <li>Check if the URL is correct</li>
          <li>Go back to the home page</li>
          <li>Browse our latest movies</li>
          <li>Contact us if you think this is an error</li>
        </ul>
      </div>

      <div class="actions">
        <router-link to="/" class="btn-primary">
          🏠 Go Home
        </router-link>
        <router-link to="/movies" class="btn-secondary">
          🎥 Browse Movies
        </router-link>
      </div>
    </div>

    <div class="illustration">
      🎞️🍿📽️
    </div>
  </div>
</template>

<script setup>
// No script needed for this simple component
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: var(--bg-color);
}

.content {
  max-width: 600px;
  margin-bottom: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.content h2 {
  font-size: 2rem;
  color: var(--text-color);
  margin: 1rem 0;
}

.content p {
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 2rem;
}

.suggestions {
  text-align: left;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.suggestions h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.suggestions ul {
  list-style: none;
  padding: 0;
}

.suggestions li {
  color: var(--text-color);
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.suggestions li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
}

.illustration {
  font-size: 4rem;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .content h2 {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .actions a {
    width: 100%;
  }
}
</style>
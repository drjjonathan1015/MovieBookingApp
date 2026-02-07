<template>
  <div class="home-page">
    <!-- Hero Section with Background Slideshow -->
    <section class="hero">
      <!-- Background Slideshow -->
      <div class="hero-background">
        <div 
          v-for="(slide, index) in heroSlides" 
          :key="index"
          :class="['slide', { active: currentSlide === index }]"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <div class="slide-overlay"></div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content">
        <h1 class="fade-in">🎬 Welcome to CinemaX</h1>
        <p class="fade-in-delay">Experience the magic of cinema with premium comfort and service</p>
        <div class="hero-search fade-in-delay-2">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search for movies..." 
            @input="handleSearch"
            @keyup.enter="scrollToMovies"
          />
          <button @click="scrollToMovies">
            🔍 Browse Movies
          </button>
        </div>
        
        <!-- Slideshow Navigation Dots -->
        <div class="slideshow-dots">
          <button 
            v-for="(slide, index) in heroSlides" 
            :key="index"
            :class="['dot', { active: currentSlide === index }]"
            @click="goToSlide(index)"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- Search and Filter Section -->
    <section class="filters-section" v-if="searchQuery || selectedGenre || selectedLanguage">
      <div class="active-filters">
        <span v-if="searchQuery" class="filter-tag">
          Search: {{ searchQuery }} <button @click="searchQuery = ''">×</button>
        </span>
        <span v-if="selectedGenre" class="filter-tag">
          Genre: {{ selectedGenre }} <button @click="selectedGenre = ''">×</button>
        </span>
        <span v-if="selectedLanguage" class="filter-tag">
          Language: {{ selectedLanguage }} <button @click="selectedLanguage = ''">×</button>
        </span>
        <button @click="clearAllFilters" class="clear-all">Clear All</button>
      </div>
    </section>

    <!-- Now Showing Section -->
    <section class="movies-section" id="now-showing">
      <div class="section-header">
        <h2>🎥 Now Showing</h2>
        <div class="filter-controls">
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

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading movies...</p>
      </div>

      <div v-else-if="filteredNowShowing.length === 0" class="no-results">
        <p>😔 No movies found matching your criteria</p>
        <button @click="clearAllFilters" class="btn-primary">Clear Filters</button>
      </div>

      <div v-else class="movies-grid">
        <div 
          v-for="movie in filteredNowShowing" 
          :key="movie.id" 
          class="movie-card"
          @click="goToMovie(movie.id)"
        >
          <div class="movie-poster">
            <img :src="movie.poster" :alt="movie.title" loading="lazy" />
            <div class="movie-overlay">
              <button class="btn-book">View Details</button>
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
    </section>

    <!-- Coming Soon Section -->
    <section class="movies-section coming-soon">
      <div class="section-header">
        <h2>🎬 Coming Soon</h2>
      </div>

      <div v-if="filteredComingSoon.length === 0" class="no-results">
        <p>No upcoming movies at the moment</p>
      </div>

      <div v-else class="movies-grid">
        <div 
          v-for="movie in filteredComingSoon" 
          :key="movie.id" 
          class="movie-card"
        >
          <div class="movie-poster">
            <img :src="movie.poster" :alt="movie.title" loading="lazy" />
            <span class="coming-soon-badge">Coming Soon</span>
            <span v-if="movie.releaseDate" class="release-date">
              {{ formatDate(movie.releaseDate) }}
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
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>Why Choose CinemaX?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎟️</div>
          <h3>Easy Booking</h3>
          <p>Book your tickets online in just a few clicks</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💺</div>
          <h3>Premium Seats</h3>
          <p>Comfortable recliner seats with ample legroom</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🍿</div>
          <h3>Delicious Snacks</h3>
          <p>Wide variety of food and beverages</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎬</div>
          <h3>Latest Movies</h3>
          <p>Watch the newest releases first</p>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
      <div class="about-content">
        <h2>About CinemaX</h2>
        <p>
          Located in the heart of the city, CinemaX provides the ultimate movie 
          experience with state-of-the-art screens, surround sound systems, and 
          comfortable seating. We're committed to bringing you the best in cinema 
          entertainment with exceptional service and amenities.
        </p>
        <div class="stats">
          <div class="stat">
            <h3>{{ nowShowing.length }}+</h3>
            <p>Movies Now Showing</p>
          </div>
          <div class="stat">
            <h3>1000+</h3>
            <p>Happy Customers</p>
          </div>
          <div class="stat">
            <h3>4.8⭐</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const router = useRouter();

// State
const nowShowing = ref([]);
const comingSoon = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedGenre = ref("");
const selectedLanguage = ref("");
const sortBy = ref("title");
const currentSlide = ref(0);
let slideInterval = null;

// Default Hero Slideshow Images
const defaultHeroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80',
    title: 'Premium Cinema Experience'
  },
  {
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80',
    title: 'Latest Blockbusters'
  },
  {
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&q=80',
    title: 'Luxury Seating'
  },
  {
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&q=80',
    title: 'State-of-the-Art Sound'
  }
];

const heroSlides = ref([...defaultHeroSlides]);

// ✅ FIX: Watch for changes in nowShowing and update slideshow
watch(nowShowing, (newMovies) => {
  updateHeroSlides(newMovies);
}, { deep: true });

// Function to update hero slides with movie posters
const updateHeroSlides = (movies) => {
  if (movies.length > 0) {
    heroSlides.value = [
      // Keep first default slide
      defaultHeroSlides[0],
      // Add up to 3 movie posters
      ...movies.slice(0, 5).map(movie => ({
        image: movie.poster || defaultHeroSlides[1].image,
        title: movie.title || 'Now Showing'
      }))
    ];
    // Reset to first slide when slides update
    currentSlide.value = 0;
  } else {
    // If no movies, use default slides
    heroSlides.value = [...defaultHeroSlides];
  }
};

// Computed properties for unique genres and languages
const genres = computed(() => {
  const allGenres = [...nowShowing.value, ...comingSoon.value]
    .map(m => m.genre)
    .filter(Boolean);
  return [...new Set(allGenres)].sort();
});

const languages = computed(() => {
  const allLanguages = [...nowShowing.value, ...comingSoon.value]
    .map(m => m.language)
    .filter(Boolean);
  return [...new Set(allLanguages)].sort();
});

// Filtered and sorted movies
const filteredNowShowing = computed(() => {
  return filterAndSort(nowShowing.value);
});

const filteredComingSoon = computed(() => {
  return filterAndSort(comingSoon.value);
});

// Functions
const filterAndSort = (movies) => {
  let filtered = movies;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(m => 
      m.title?.toLowerCase().includes(query) ||
      m.genre?.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query)
    );
  }

  // Apply genre filter
  if (selectedGenre.value) {
    filtered = filtered.filter(m => m.genre === selectedGenre.value);
  }

  // Apply language filter
  if (selectedLanguage.value) {
    filtered = filtered.filter(m => m.language === selectedLanguage.value);
  }

  // Apply sorting
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
};

const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
};

const fetchMovies = async () => {
  try {
    loading.value = true;
    const moviesCol = collection(db, "movies");
    const moviesSnapshot = await getDocs(moviesCol);
    const movies = moviesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    nowShowing.value = movies.filter(m => m.status === "now showing");
    comingSoon.value = movies.filter(m => m.status === "coming soon");

    // Hero slides will update automatically via watch()
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

const scrollToMovies = () => {
  document.getElementById('now-showing')?.scrollIntoView({ 
    behavior: 'smooth' 
  });
};

const handleSearch = () => {
  // Debounce could be added here if needed
};

const clearAllFilters = () => {
  searchQuery.value = "";
  selectedGenre.value = "";
  selectedLanguage.value = "";
  sortBy.value = "title";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Slideshow functions
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
  // Restart slideshow timer when manually changing slides
  stopSlideshow();
  startSlideshow();
};

const startSlideshow = () => {
  slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
};

const stopSlideshow = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

onMounted(() => {
  fetchMovies();
  startSlideshow();
});

onUnmounted(() => {
  stopSlideshow();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section with Slideshow */
.hero {
  position: relative;
  height: 600px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.slide.active {
  opacity: 1;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.35),
    rgba(118, 75, 162, 0.35)
  );
}

.hero-slide img {
  filter: brightness(1.15) contrast(1.1);
}


.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
}

.hero p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Animation classes */
.fade-in {
  animation: fadeInUp 0.8s ease-out;
}

.fade-in-delay {
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.fade-in-delay-2 {
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-search {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.hero-search input {
  flex: 1;
  padding: 1.2rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hero-search button {
  padding: 1.2rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hero-search button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Slideshow Navigation Dots */
.slideshow-dots {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.2);
}

.dot.active {
  background: white;
  width: 30px;
  border-radius: 6px;
}

/* Filters Section */
.filters-section {
  padding: 1rem 2rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 70px;
  z-index: 100;
}

.active-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.filter-tag button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: transform 0.2s;
}

.filter-tag button:hover {
  transform: scale(1.2);
}

.clear-all {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.clear-all:hover {
  background: var(--primary-color);
  color: white;
}

/* Movies Section */
.movies-section {
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 2rem;
  color: var(--text-color);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.filter-select:hover {
  border-color: var(--primary-color);
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
  padding: 4rem 2rem;
  color: var(--text-color);
}

.no-results p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
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
  padding-top: 150%; /* 2:3 aspect ratio */
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

.btn-book {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-book:hover {
  background: var(--primary-hover);
}

.rating-badge,
.coming-soon-badge,
.release-date {
  position: absolute;
  padding: 0.3rem 0.8rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 5px;
}

.rating-badge {
  top: 10px;
  right: 10px;
}

.coming-soon-badge {
  top: 10px;
  left: 10px;
  background: var(--primary-color);
}

.release-date {
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
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

/* Features Section */
.features {
  padding: 4rem 2rem;
  background: var(--card-bg);
  text-align: center;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 3rem;
  color: var(--text-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2rem;
  border-radius: 10px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.feature-card p {
  color: var(--text-color);
  opacity: 0.7;
}

/* About Section */
.about {
  padding: 4rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.about-content {
  text-align: center;
}

.about h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.about p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.stat {
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: var(--shadow);
  transition: transform 0.3s;
}

.stat:hover {
  transform: translateY(-5px);
}

.stat h3 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat p {
  color: var(--text-color);
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    height: 500px;
  }

  .hero h1 {
    font-size: 2.2rem;
  }

  .hero p {
    font-size: 1.1rem;
  }

  .hero-search {
    flex-direction: column;
  }

  .slideshow-dots {
    margin-top: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 450px;
  }

  .hero h1 {
    font-size: 1.8rem;
  }

  .hero p {
    font-size: 1rem;
  }
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}
</style>
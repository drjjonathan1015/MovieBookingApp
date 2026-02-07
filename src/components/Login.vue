<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>👋 Welcome Back!</h1>
      <p>Login to book your favorite movie tickets at CinemaX.</p>

      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="your@email.com"
            required
            :class="{ 'error': errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              id="password"
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :class="{ 'error': errors.password }"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="toggle-password"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            Forgot Password?
          </a>
        </div>

        <button 
          type="submit" 
          class="btn-submit" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div class="divider">
        <span>or</span>
      </div>

      <button @click="loginWithGoogle" class="btn-google" :disabled="isLoading">
        <span>🔍</span> Continue with Google
      </button>

      <p class="switch">
        Don't have an account? 
        <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Form state
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const errors = ref({
  email: "",
  password: ""
});

// Validation
const validateForm = () => {
  errors.value = { email: "", password: "" };
  let isValid = true;

  if (!email.value) {
    errors.value.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Please enter a valid email";
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = "Password is required";
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters";
    isValid = false;
  }

  return isValid;
};

// Login function
const login = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    errorMessage.value = "";
    
    await signInWithEmailAndPassword(auth, email.value, password.value);
    
    // Redirect to intended page or movies
    const redirect = route.query.redirect || "/movies";
    router.push(redirect);
  } catch (error) {
    console.error("Login error:", error);
    
    // User-friendly error messages
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage.value = "Invalid email address";
        break;
      case "auth/user-disabled":
        errorMessage.value = "This account has been disabled";
        break;
      case "auth/user-not-found":
        errorMessage.value = "No account found with this email";
        break;
      case "auth/wrong-password":
        errorMessage.value = "Incorrect password";
        break;
      case "auth/invalid-credential":
        errorMessage.value = "Invalid email or password";
        break;
      case "auth/too-many-requests":
        errorMessage.value = "Too many failed attempts. Please try again later";
        break;
      case "auth/network-request-failed":
        errorMessage.value = "Network error. Please check your connection";
        break;
      default:
        errorMessage.value = "Login failed. Please try again";
    }
  } finally {
    isLoading.value = false;
  }
};

// Google Sign In - CORRECTED VERSION
const loginWithGoogle = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const uid = result.user.uid;
    
    // Check if user document exists in Firestore
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: result.user.displayName || "User",
        email: result.user.email,
        phone: "",
        createdAt: new Date(),
        updatedAt: new Date()
        // Note: role field intentionally not added - defaults to regular user
        // Admin users must be created explicitly via admin script
      });
      console.log("Created new user document for Google sign-in");
    }
    
    const redirect = route.query.redirect || "/movies";
    router.push(redirect);
  } catch (error) {
    console.error("Google login error:", error);
    
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage.value = "Sign-in cancelled";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage.value = "Pop-up was blocked. Please allow pop-ups for this site";
    } else if (error.code === "auth/cancelled-popup-request") {
      errorMessage.value = "Only one sign-in popup allowed at a time";
    } else {
      errorMessage.value = "Failed to sign in with Google";
    }
  } finally {
    isLoading.value = false;
  }
};

// Forgot Password
const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = "Please enter your email address first";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.value);
    alert("Password reset email sent! Check your inbox.");
    errorMessage.value = "";
  } catch (error) {
    console.error("Password reset error:", error);
    if (error.code === "auth/user-not-found") {
      errorMessage.value = "No account found with this email address";
    } else {
      errorMessage.value = "Failed to send reset email. Please try again.";
    }
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-box {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 15px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-box h1 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 2rem;
}

.auth-box > p {
  margin-bottom: 2rem;
  color: var(--text-color);
  opacity: 0.7;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
}

.form-group input {
  display: block;
  width: 100%;
  padding: 0.875rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-group input.error {
  border-color: #e74c3c;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  color: #e74c3c;
  font-size: 0.85rem;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.toggle-password:hover {
  opacity: 1;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.remember-me input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s, transform 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: var(--card-bg);
  padding: 0 1rem;
  color: var(--text-color);
  opacity: 0.6;
  font-size: 0.9rem;
}

.btn-google {
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px solid var(--border-color);
  color: var(--text-color);
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-google:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: rgba(66, 184, 131, 0.05);
}

.btn-google:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color);
}

.switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.switch a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-box {
    padding: 2rem 1.5rem;
  }

  .auth-box h1 {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
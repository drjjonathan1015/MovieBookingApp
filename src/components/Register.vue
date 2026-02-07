<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>✨ Join CinemaX</h1>
      <p>Create your account to start booking amazing movies!</p>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            id="name"
            v-model="name" 
            type="text" 
            placeholder="John Doe"
            required
            :class="{ 'error': errors.name }"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

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
          <label for="phone">Phone Number</label>
          <input 
            id="phone"
            v-model="phone" 
            type="tel" 
            placeholder="+94 123 456 789"
            required
            :class="{ 'error': errors.phone }"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              id="password"
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 6 characters"
              required
              :class="{ 'error': errors.password }"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="toggle-password"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrength"></div>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword" 
            type="password"
            placeholder="Re-enter password"
            required
            :class="{ 'error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" v-model="agreedToTerms" required />
          <span>I agree to the <a href="#">Terms & Conditions</a></span>
        </label>

        <button 
          type="submit" 
          class="btn-submit" 
          :disabled="isLoading || !agreedToTerms"
        >
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div class="divider">
        <span>or</span>
      </div>

      <button @click="registerWithGoogle" class="btn-google" :disabled="isLoading">
        <span>🔍</span> Sign up with Google
      </button>

      <p class="switch">
        Already have an account? 
        <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRouter } from "vue-router";
import { setDoc, doc } from "firebase/firestore";

const router = useRouter();

const name = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const agreedToTerms = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const errors = ref({});

const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return '';
  if (pwd.length < 6) return 'weak';
  if (pwd.length < 10 && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)) return 'medium';
  if (pwd.length >= 10 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
  return 'medium';
});

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!name.value.trim()) {
    errors.value.name = "Name is required";
    isValid = false;
  } else if (name.value.trim().length < 2) {
    errors.value.name = "Name must be at least 2 characters";
    isValid = false;
  }

  if (!email.value) {
    errors.value.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Please enter a valid email";
    isValid = false;
  }

  if (!phone.value) {
    errors.value.phone = "Phone number is required";
    isValid = false;
  } else if (!/^\+?[\d\s-]{10,}$/.test(phone.value)) {
    errors.value.phone = "Please enter a valid phone number";
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = "Password is required";
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters";
    isValid = false;
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = "Please confirm your password";
    isValid = false;
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  return isValid;
};

const register = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const uid = userCredential.user.uid;

    await updateProfile(userCredential.user, {
      displayName: name.value
    });

    await setDoc(doc(db, "users", uid), {
      name: name.value,
      email: email.value,
      phone: phone.value,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    router.push("/movies");
  } catch (error) {
    console.error("Registration error:", error);
    
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage.value = "This email is already registered";
        break;
      case "auth/invalid-email":
        errorMessage.value = "Invalid email address";
        break;
      case "auth/weak-password":
        errorMessage.value = "Password is too weak";
        break;
      case "auth/network-request-failed":
        errorMessage.value = "Network error. Please check your connection";
        break;
      default:
        errorMessage.value = "Registration failed. Please try again";
    }
  } finally {
    isLoading.value = false;
  }
};

const registerWithGoogle = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const uid = result.user.uid;

    await setDoc(doc(db, "users", uid), {
      name: result.user.displayName || "User",
      email: result.user.email,
      phone: phone.value || "",
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    router.push("/movies");
  } catch (error) {
    console.error("Google registration error:", error);
    errorMessage.value = "Failed to sign up with Google";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Use same styles as Login.vue with additions */
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
  max-width: 500px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
  max-height: 90vh;
  overflow-y: auto;
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
}

.password-strength {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  width: 0;
  transition: all 0.3s;
}

.strength-bar.weak {
  width: 33%;
  background: #e74c3c;
}

.strength-bar.medium {
  width: 66%;
  background: #f39c12;
}

.strength-bar.strong {
  width: 100%;
  background: #27ae60;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.checkbox-label a {
  color: var(--primary-color);
  text-decoration: none;
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

.divider::before { left: 0; }
.divider::after { right: 0; }

.divider span {
  background: var(--card-bg);
  padding: 0 1rem;
  color: var(--text-color);
  opacity: 0.6;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-google:hover:not(:disabled) {
  border-color: var(--primary-color);
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
</style>
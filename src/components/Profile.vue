<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1>👤 My Profile</h1>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>

      <div v-else class="profile-content">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar">
              {{ userData.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <button @click="changeAvatar" class="btn-secondary">Change Photo</button>
          </div>
          
          <div class="user-info">
            <h2>{{ userData.name }}</h2>
            <p>{{ user.email }}</p>
            <span class="member-since">
              Member since {{ formatDate(userData.createdAt) }}
            </span>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <h3>{{ totalBookings }}</h3>
            <p>Total Bookings</p>
          </div>
          <div class="stat-card">
            <h3>{{ totalSpent }}</h3>
            <p>Total Spent (Rs. )</p>
          </div>
          <div class="stat-card">
            <h3>{{ favoriteGenre || 'N/A' }}</h3>
            <p>Favorite Genre</p>
          </div>
        </div>

        <form @submit.prevent="updateProfile" class="profile-form">
          <h3>Personal Information</h3>
          
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              id="name"
              v-model="formData.name" 
              type="text"
              :disabled="!isEditing"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email (Cannot be changed)</label>
            <input 
              id="email"
              :value="user.email" 
              type="email"
              disabled
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input 
              id="phone"
              v-model="formData.phone" 
              type="tel"
              :disabled="!isEditing"
            />
          </div>

          <div class="form-actions">
            <button 
              v-if="!isEditing"
              type="button" 
              @click="isEditing = true" 
              class="btn-primary"
            >
              ✏️ Edit Profile
            </button>
            <template v-else>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : '💾 Save Changes' }}
              </button>
              <button 
                type="button" 
                @click="cancelEdit" 
                class="btn-secondary"
                :disabled="isSaving"
              >
                ❌ Cancel
              </button>
            </template>
          </div>
        </form>

        <div class="danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <button @click="handleDeleteAccount" class="btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = auth.currentUser;
const loading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);
const userData = ref({});
const formData = ref({});
const bookings = ref([]);

const totalBookings = computed(() => bookings.value.length);
const totalSpent = computed(() => 
  bookings.value.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
);
const favoriteGenre = computed(() => 'Action'); // Could be calculated from booking history

const fetchUserData = async () => {
  try {
    loading.value = true;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      userData.value = userDoc.data();
      formData.value = { ...userDoc.data() };
    }

    // Fetch bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );
    const bookingsSnap = await getDocs(bookingsQuery);
    bookings.value = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user data:', error);
    alert('Failed to load profile data');
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  try {
    isSaving.value = true;
    await updateDoc(doc(db, 'users', user.uid), {
      name: formData.value.name,
      phone: formData.value.phone,
      updatedAt: new Date()
    });
    userData.value = { ...formData.value };
    isEditing.value = false;
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  } finally {
    isSaving.value = false;
  }
};

const cancelEdit = () => {
  formData.value = { ...userData.value };
  isEditing.value = false;
};

const changeAvatar = () => {
  alert('Avatar upload feature coming soon!');
};

const handleDeleteAccount = async () => {
  const confirmed = confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );
  if (!confirmed) return;

  const doubleConfirm = prompt('Type "DELETE" to confirm:');
  if (doubleConfirm !== 'DELETE') {
    alert('Account deletion cancelled');
    return;
  }

  try {
    await deleteUser(user);
    alert('Account deleted successfully');
    router.push('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Failed to delete account. Please try again or contact support.');
  }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: var(--bg-color);
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-container > h1 {
  color: var(--text-color);
  margin-bottom: 2rem;
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

.profile-content {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.avatar-section {
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.user-info h2 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.user-info p {
  color: var(--text-color);
  opacity: 0.7;
}

.member-since {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(66, 184, 131, 0.1);
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 0.85rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: rgba(66, 184, 131, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(66, 184, 131, 0.2);
}

.stat-card h3 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
}

.profile-form {
  margin-bottom: 2rem;
}

.profile-form h3 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  border-color: var(--primary-color);
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.danger-zone {
  margin-top: 3rem;
  padding: 1.5rem;
  border: 2px solid #e74c3c;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.05);
}

.danger-zone h3 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
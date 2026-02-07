<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>👥 Users Management</h1>
      <div class="header-actions">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by name or email..." 
          class="search-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading users...
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <p>{{ searchQuery ? 'No users found matching your search.' : 'No users registered yet.' }}</p>
    </div>

    <div v-else class="users-container">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ adminUsers }}</div>
          <div class="stat-label">Admins</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ regularUsers }}</div>
          <div class="stat-label">Regular Users</div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td data-label="Name">
                <div class="user-info">
                  <div class="user-avatar">{{ getInitials(user.name) }}</div>
                  <span>{{ user.name || 'N/A' }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td data-label="Email">{{ user.email }}</td>
                <td data-label="Role">
                  <span :class="['role-badge', user.role]">
                    {{ user.role || 'user' }}
                  </span>
              </td>
              <td data-label="Joined">{{ formatDate(user.createdAt) }}</td>
              <td data-label="Actions">
                
                <!-- action buttons -->
                <div class="action-buttons">
                  <button 
                    v-if="user.role !== 'admin'" 
                    @click="toggleRole(user)" 
                    class="btn-action promote"
                    title="Make Admin"
                  >
                    👑 Make Admin
                  </button>
                  <button 
                    v-else-if="user.id !== currentUserId"
                    @click="toggleRole(user)" 
                    class="btn-action demote"
                    title="Remove Admin"
                  >
                    👤 Remove Admin
                  </button>
                  <button 
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user)" 
                    class="btn-action delete"
                    title="Delete User"
                  >
                    🗑️ Delete
                  </button>
                  <span v-else class="current-user-label">You</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const users = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const currentUserId = ref(null);

// Get current user ID
onMounted(() => {
  const user = auth.currentUser;
  if (user) {
    currentUserId.value = user.uid;
  }
});

const fetchUsers = async () => {
  try {
    loading.value = true;
    const snapshot = await getDocs(collection(db, "users"));
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by creation date (newest first)
    users.value.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to load users");
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query)
  );
});

const totalUsers = computed(() => users.value.length);
const adminUsers = computed(() => users.value.filter(u => u.role === 'admin').length);
const regularUsers = computed(() => users.value.filter(u => u.role !== 'admin').length);

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const toggleRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin';
  const action = newRole === 'admin' ? 'promote to admin' : 'remove admin privileges';
  
  if (!confirm(`Are you sure you want to ${action} for ${user.name || user.email}?`)) {
    return;
  }

  try {
    await updateDoc(doc(db, "users", user.id), {
      role: newRole
    });
    
    alert(`✅ User ${newRole === 'admin' ? 'promoted to admin' : 'admin privileges removed'} successfully!`);
    await fetchUsers();
  } catch (error) {
    console.error("Error updating user role:", error);
    alert("Failed to update user role");
  }
};

const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, "users", user.id));
    alert("✅ User deleted successfully!");
    await fetchUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete user");
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  background: var(--bg-color);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 0.95rem;
  min-width: 300px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
  opacity: 0.7;
}

.users-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: var(--shadow);
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Table */
.table-container {
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: var(--shadow);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.users-table th {
  background: var(--bg-color);
  color: var(--text-color);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.users-table tbody tr {
  transition: background 0.2s;
}

.users-table tbody tr:hover {
  background: var(--bg-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.role-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.role-badge.user {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-action.promote {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.btn-action.promote:hover {
  background: #2ecc71;
  color: white;
}

.btn-action.demote {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.btn-action.demote:hover {
  background: #f39c12;
  color: white;
}

.btn-action.delete {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.btn-action.delete:hover {
  background: #e74c3c;
  color: white;
}

.current-user-label {
  padding: 0.5rem 0.8rem;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    min-width: 100%;
  }

  .users-table {
    font-size: 0.9rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  /* ===== ENHANCED MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .search-input {
    min-width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1.2rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  /* Convert table to cards */
  .table-container {
    overflow-x: auto;
  }

  .users-table {
    display: block;
    font-size: 0.9rem;
  }

  .users-table thead {
    display: none;
  }

  .users-table tbody {
    display: block;
  }

  .users-table tr {
    display: block;
    margin-bottom: 1rem;
    background: var(--card-bg);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow);
  }

  .users-table td {
    display: block;
    padding: 0.5rem 0;
    border: none;
  }

  .users-table td::before {
    content: attr(data-label);
    font-weight: 600;
    display: inline-block;
    width: 80px;
    opacity: 0.7;
  }

  .user-info {
    justify-content: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn-action {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 1.3rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .users-table tr {
    padding: 0.75rem;
  }
}
}
</style>
import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// User pages
import Home from "../components/Home.vue";
import Movies from "../components/Movies.vue";
import MovieDetails from "../components/MovieDetails.vue";
import SeatSelection from "../components/SeatSelection.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import MyBookings from "../components/MyBookings.vue";
import Profile from "../components/Profile.vue";
import NotFound from "../components/Notfound.vue";
import Payment from "../components/Payment.vue";
import PaymentSuccess from "../components/PaymentSuccess.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/movies", component: Movies },
  { path: "/movies/:id", component: MovieDetails },
  { path: "/seats/:showId", component: SeatSelection, meta: { requiresAuth: true } },
  { path: "/my-bookings", component: MyBookings, meta: { requiresAuth: true } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  {
    path: "/payment",
    name: "Payment",
    component: Payment,
    meta: { requiresAuth: true }
  },
  {
    path: "/payment-success",
    name: "PaymentSuccess",
    component: PaymentSuccess,
    meta: { requiresAuth: true }
  },

  // Admin routes
  {
    path: "/admin",
    component: () => import("../admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      { 
        path: "", 
        redirect: "/admin/dashboard" 
      },
      { 
        path: "dashboard", 
        component: () => import("../admin/AdminDashboard.vue") 
      },
      { 
        path: "movies", 
        component: () => import("../admin/MoviesList.vue") 
      },
      { 
        path: "movies/add", 
        component: () => import("../admin/AddMovie.vue") 
      },
      { 
        path: "movies/edit/:id", 
        component: () => import("../admin/EditMovie.vue") 
      },
      { 
        path: "shows", 
        component: () => import("../admin/ShowsList.vue") 
      },
      { 
        path: "shows/add", 
        component: () => import("../admin/AddShow.vue") 
      },
      { 
        path: "shows/edit/:movieId/:id", 
        component: () => import("../admin/EditShow.vue") 
      },
      { 
        path: "seat-preview/:showId", 
        component: () => import("../admin/SeatPreview.vue") 
      },
      { 
        path: "bookings", 
        component: () => import("../admin/AdminBookings.vue") 
      },
      { 
        path: "users", 
        component: () => import("../admin/AdminUsers.vue") 
      }
    ]
  },

  { path: "/:pathMatch(.*)*", component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global guard
router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;

  if (to.meta.requiresAuth && !user) {
    return next("/login");
  }

  if (to.meta.requiresAdmin) {
    if (!user) return next("/login");
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists() || snap.data().role !== "admin") return next("/");
  }

  next();
});

export default router;
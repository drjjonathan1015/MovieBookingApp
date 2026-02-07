# 🎬 CinemaX - Movie Booking Application

> A modern, full-featured movie booking platform built with Vue 3, Firebase, and PWA capabilities.

![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## ✨ Features

### 🎯 Core Features
- **Browse Movies** - View now showing and upcoming movies
- **Interactive Seat Selection** - Real-time availability (10 rows × 15 seats per show)
- **Online Booking** - Secure ticket reservation system
- **QR Code Tickets** - Digital tickets with scannable QR codes
- **Email Confirmations** - Automated booking confirmations via EmailJS
- **PDF Downloads** - Download tickets and invoices
- **Booking Management** - View and track your bookings
- **User Profiles** - Manage personal information

### 👑 Admin Panel
- **Dashboard** - Statistics overview (movies, shows, bookings)
- **Movie Management** - Add, edit, delete movies
- **Show Management** - Schedule and manage showtimes
- **Seat Preview** - Visual seat layout with occupancy stats
- **Bookings Overview** - View all customer bookings
- **User Management** - Manage users and assign admin roles

### 🎨 UX Features
- **Responsive Design** - Fully mobile optimized
- **Dark/Light Mode** - Theme switcher
- **PWA Support** - Installable on mobile and desktop
- **Offline Capable** - Service worker caching
- **Loading Animations** - Lottie animations
- **Toast Notifications** - Real-time feedback

---

## 📸 Screenshots

| Home Page | Seat Selection | Admin Dashboard |
|-----------|----------------|-----------------|
| ![Home](docs/screenshots/home.png) | ![Seats](docs/screenshots/seats.png) | ![Admin](docs/screenshots/admin.png) |

---

## 🛠 Tech Stack

**Frontend**
- Vue 3 (Composition API)
- Vue Router 4
- Vite 5
- CSS3 (Custom Properties for theming)

**Backend & Services**
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Hosting

**Additional Libraries**
- qrcode.js - QR code generation
- jsPDF - PDF generation
- EmailJS - Email service
- Vue3 Lottie - Animations
- Vite PWA Plugin - Progressive Web App

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Firebase account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/cinemax-booking.git
cd cinemax-booking

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your Firebase credentials
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_domain
# etc...

# Run development server
npm run dev
```

Visit `http://localhost:5173`

---

## ⚙️ Configuration

### 1. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `cinemax-booking`
3. Enable Authentication (Email/Password)
4. Create Firestore Database

#### Configure Security Rules

Deploy the provided `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read for movies
    match /movies/{movieId} {
      allow read: if true;
      allow write: if isAdmin();
      
      match /shows/{showId} {
        allow read: if true;
        allow write: if isAdmin();
        
        match /seats/{seatId} {
          allow read: if true;
          allow update: if isSignedIn();
          allow create, delete: if isAdmin();
        }
      }
    }
    
    // Bookings - users can only see their own
    match /bookings/{bookingId} {
      allow create: if isSignedIn() && 
                      request.resource.data.userId == request.auth.uid;
      allow read: if isSignedIn() && 
                    resource.data.userId == request.auth.uid;
      allow read, write: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow read, update: if isSignedIn() && request.auth.uid == userId;
      allow read, write: if isAdmin();
    }
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 2. Environment Variables

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS (Optional)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Import Sample Data

```bash
cd admin-import
npm install
node importMovies.js
```

This creates:
- 5 sample movies
- Multiple shows per movie
- 150 seats per show (10 rows × 15 seats)

### 4. Create Admin User

After registering a user:

1. Go to Firebase Console → Firestore
2. Open `users` collection
3. Find your user document
4. Add field: `role` → `"admin"` (string type)

---

## 📖 Usage

### User Workflow

1. **Browse** → View available movies
2. **Select Show** → Choose date and time
3. **Pick Seats** → Interactive seat selection
4. **Login** → Authenticate (if not logged in)
5. **Confirm** → Review booking details
6. **Payment** → Process payment
7. **Receive** → Get QR code ticket + email confirmation

### Admin Workflow

1. **Login** → Use admin credentials
2. **Navigate** → Go to `/admin/dashboard`
3. **Manage**:
   - Add/Edit Movies
   - Schedule Shows
   - View Bookings
   - Manage Users

---

## 📁 Project Structure

```
cinemax-booking/
├── public/
│   ├── icons/              # PWA icons (72px - 512px)
│   ├── splash/             # iOS splash screens
│   └── manifest.json       # PWA manifest
├── src/
│   ├── admin/              # Admin panel components
│   │   ├── AdminLayout.vue
│   │   ├── AdminDashboard.vue
│   │   ├── MoviesList.vue
│   │   ├── AddMovie.vue
│   │   ├── EditMovie.vue
│   │   ├── ShowsList.vue
│   │   ├── AddShow.vue
│   │   ├── EditShow.vue
│   │   ├── SeatPreview.vue
│   │   ├── AdminBookings.vue
│   │   └── AdminUsers.vue
│   ├── components/         # User-facing components
│   │   ├── Home.vue
│   │   ├── Movies.vue
│   │   ├── MovieDetails.vue
│   │   ├── SeatSelection.vue
│   │   ├── Payment.vue
│   │   ├── PaymentSuccess.vue
│   │   ├── MyBookings.vue
│   │   ├── Profile.vue
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── router/
│   │   └── index.js        # Vue Router configuration
│   ├── services/
│   │   ├── emailService.js # EmailJS integration
│   │   └── emailConfig.js  # Email configuration
│   ├── utils/
│   │   └── pdfGenerator.js # PDF ticket generation
│   ├── App.vue             # Root component
│   ├── main.js             # Vue app entry
│   └── firebase.js         # Firebase configuration
├── admin-import/           # Data import scripts
│   ├── importMovies.js
│   ├── movies.json
│   └── package.json
├── firestore.rules         # Firestore security rules
├── vite.config.js          # Vite configuration
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Collections

#### `movies`
```javascript
{
  title: "Inception",
  description: "A mind-bending thriller...",
  duration: "2h 28m",
  language: "English",
  genre: "Sci-Fi",
  rating: 8.8,
  poster: "https://...",
  status: "now showing",  // or "coming soon"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `movies/{movieId}/shows` (subcollection)
```javascript
{
  date: "2026-02-15",
  time: "18:30",
  price: 500,
  theater: "Screen 1",
  createdAt: Timestamp
}
```

#### `movies/{movieId}/shows/{showId}/seats` (subcollection)
```javascript
{
  seatNumber: "A1",  // Format: [Row][Number]
  isBooked: false,
  price: 500
}
```

**Seat Layout:**
- 10 rows: A, B, C, D, E, F, G, H, I, J
- 15 seats per row
- 3 sections: Left (1-5), Center (6-10), Right (11-15)
- Total: 150 seats per show

#### `bookings`
```javascript
{
  userId: "user_uid",
  userEmail: "user@example.com",
  movieId: "movie_id",
  movieTitle: "Inception",
  showId: "show_id",
  showDate: "2026-02-15",
  showTime: "18:30",
  seats: ["A1", "A2"],
  totalPrice: 1000,
  status: "confirmed",  // "pending", "confirmed", "cancelled"
  paymentMethod: "credit_card",
  theaterName: "Screen 1",
  createdAt: Timestamp
}
```

#### `users`
```javascript
{
  email: "user@example.com",
  name: "John Doe",
  role: "user",  // or "admin"
  createdAt: Timestamp
}
```

---

## 🚢 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Hosting
# - Use existing project
# - Public directory: dist
# - Single-page app: Yes

# Build app
npm run build

# Deploy
firebase deploy
```

Your app: `https://your-project.web.app`

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

### Code Style

- ES6+ syntax
- Vue 3 Composition API
- Semantic HTML
- BEM CSS naming (where applicable)
- Meaningful variable names

---

## 🐛 Troubleshooting

### Common Issues

**"Failed to load movies" error**
- Update Firestore security rules to allow public read
- See `firestore.rules` file

**"pwa-register.js not found" error**
- Remove `<script src="/pwa-register.js"></script>` from index.html
- Or install vite-plugin-pwa properly
- See `PWA_ERROR_FIX.md`

**Mobile view not responsive**
- Apply mobile CSS fixes
- See `MOBILE_RESPONSIVE_FIXES.md` and `ADMIN_MOBILE_CSS_COMPLETE.md`

**Admin panel not accessible**
- Ensure user has `role: "admin"` in Firestore users collection

**Seats not loading**
- Check Firestore rules allow read access to seats
- Verify show exists and has seats subcollection

---

## 📚 Documentation

- [Firebase Rules Fix](FIREBASE_RULES_FIX.md) - Fix permission errors
- [PWA Error Fix](PWA_ERROR_FIX.md) - Fix PWA registration issues
- [Mobile Responsive Fixes](MOBILE_RESPONSIVE_FIXES.md) - Mobile CSS fixes
- [Admin Mobile CSS](ADMIN_MOBILE_CSS_COMPLETE.md) - Admin panel mobile optimization

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Vue.js team
- Firebase team
- Vite team
- Open source community

---

## 📧 Contact

**Project Link:** [https://github.com/drjjonathan1015/MovieBookingApp](https://github.com/drjjonathan1015/MovieBookingApp)

**Issues:** [GitHub Issues](https://github.com/drjjonathan1015/MovieBookingApp/issues)

---

<div align="center">

## 👨‍💻 Author

G.D. Jonathan
🎓 BSc (Hons) Computer Science – SEUSL
📍 Sri Lanka**

⭐ Star this repo if you find it helpful!

![GitHub stars](https://img.shields.io/github/stars/yourusername/cinemax-booking?style=social)

</div>
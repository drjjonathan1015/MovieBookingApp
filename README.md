# 🎬 CinemaX - Movie Booking System

A modern, full-featured movie ticket booking web application built with Vue.js and Firebase. Book your favorite movies, select your seats, and enjoy a seamless cinema experience!

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://moviebookingapp-c495c.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)

---

## 🌟 Live Demo

### 🔗 **[https://moviebookingapp-c495c.web.app/](https://moviebookingapp-c495c.web.app/)**

> Live and fully functional! Try it now!

### 👤 Demo Credentials

**Admin Account:**
- Email: `admin@cinemax.com`
- Password: `admin123`

**User Account:**
- Email: `user@cinemax.com`
- Password: `user123`

---

## ✨ Features

### 🎭 User Features
- 🎬 **Browse Movies** - View now showing and upcoming movies without login
- 💺 **Interactive Seat Selection** - Real-time seat availability (10 rows × 15 seats per show)
- 🎟️ **Book Tickets** - Easy and secure ticket booking
- 📧 **Email Confirmations** - Automatic booking confirmations via EmailJS
- 📱 **QR Code Tickets** - Digital tickets with QR codes for theater entry
- 📄 **PDF Download** - Download tickets and invoices as PDF
- 👤 **User Profile** - Manage personal information
- 📊 **Booking History** - View all past and upcoming bookings
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop

### 👑 Admin Features
- 📊 **Dashboard** - Overview of movies, shows, and bookings
- 🎥 **Movie Management** - Add, edit, and delete movies with posters
- 🎭 **Show Management** - Create and manage show timings
- 💺 **Seat Preview** - Visual seat layout with real-time booking status
- 👥 **User Management** - Manage users and assign admin roles
- 🎫 **Booking Management** - View and manage all bookings
- 📈 **Statistics** - Real-time occupancy rates and analytics
- 🔐 **Role-Based Access** - Secure admin-only features

### 🔐 Security Features
- ✅ Firebase Authentication (Email/Password)
- ✅ Role-based access control (Admin/User)
- ✅ Secure Firestore security rules
- ✅ Protected admin routes
- ✅ Public movie browsing (no login required)
- ✅ Secure booking validation

### 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimized
- ✅ Desktop enhanced
- ✅ Touch-friendly interfaces
- ✅ Adaptive layouts for all screen sizes

---

## 🚀 Tech Stack

### Frontend
- **Vue 3** (Composition API) - Progressive JavaScript framework
- **Vue Router 4** - Official routing solution
- **Vite** - Next-generation frontend tooling
- **CSS3** - Modern styling with CSS variables

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Hosting** - Fast and secure web hosting
- **EmailJS** - Email service integration

### Libraries & Tools
- **QRCode.js** - QR code generation for tickets
- **jsPDF** - PDF generation for invoices
- **Vue3-Lottie** - Beautiful Lottie animations
- **Firebase Admin SDK** - Backend data management

---

## 📋 Prerequisites

- **Node.js** v16+ - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **Firebase Account** - [Sign up free](https://firebase.google.com/)

---

## 🛠️ Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/drjjonathan1015/MovieBookingApp.git
cd cinemax-booking

# Install dependencies
npm install
```

### 2. Firebase Configuration

Create `src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBxLUiOXCT1234567890abcdefghijklm",
  authDomain: "moviebookingapp-c495c.firebaseapp.com",
  projectId: "moviebookingapp-c495c",
  storageBucket: "moviebookingapp-c495c.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### 3. Firestore Security Rules

Copy contents from `firestore.rules` file to Firebase Console → Firestore → Rules.

### 4. Import Sample Data

```bash
cd admin
npm install
node importMovies.js
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Build for production
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy
firebase deploy
```

Your app will be live at: `https://moviebookingapp-c495c.web.app/`

---

## 📁 Project Structure

```
cinemax-booking/
├── public/                    # Static assets
│   ├── icons/                # PWA icons
│   └── manifest.json         # PWA manifest
├── src/
│   ├── views/                # Page components
│   │   ├── Home.vue          # Landing page
│   │   ├── Movies.vue        # Movies catalog
│   │   ├── MovieDetails.vue  # Movie details
│   │   ├── SeatSelection.vue # Seat booking (MOBILE OPTIMIZED)
│   │   ├── PaymentSuccess.vue # Booking confirmation (MOBILE OPTIMIZED)
│   │   ├── MyBookings.vue    # User bookings
│   │   ├── Login.vue         # User login
│   │   ├── Register.vue      # User registration
│   │   └── admin/            # Admin panel (ALL MOBILE RESPONSIVE)
│   │       ├── AdminLayout.vue      # Admin sidebar layout
│   │       ├── AdminDashboard.vue   # Statistics dashboard
│   │       ├── MoviesList.vue       # Manage movies
│   │       ├── AddMovie.vue         # Add new movie
│   │       ├── EditMovie.vue        # Edit movie
│   │       ├── ShowsList.vue        # Manage shows
│   │       ├── AddShow.vue          # Add new show
│   │       ├── EditShow.vue         # Edit show
│   │       ├── SeatPreview.vue      # View seat layout
│   │       ├── AdminBookings.vue    # All bookings
│   │       └── AdminUsers.vue       # User management
│   ├── router/               # Vue Router
│   │   └── index.js          # Route configuration
│   ├── services/             # Services
│   │   ├── emailService.js   # EmailJS integration
│   │   └── emailConfig.js    # Email configuration
│   ├── utils/                # Utilities
│   │   └── pdfGenerator.js   # PDF generation
│   ├── firebase.js           # Firebase config
│   ├── App.vue               # Root component
│   └── main.js               # Entry point
├── admin/                    # Admin scripts
│   ├── importMovies.js       # Data import script
│   └── package.json
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── firestore.rules           # Firestore security rules
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🎯 Key Features Explained

### Seat Layout System

- **10 Rows** (A-J) × **15 Seats** per row = **150 seats per show**
- **3 Sections**: Left (1-5), Center (6-10), Right (11-15)
- **Real-time Updates**: Seat availability syncs across all users
- **Visual Feedback**: Available, Selected, Booked states
- **Mobile Optimized**: Touch-friendly seat selection on mobile

### Booking Flow

1. Browse movies (no login required)
2. Select movie → Choose show
3. **Login required** for seat selection
4. Select seats interactively
5. Review booking summary
6. Confirm and pay
7. Receive confirmation email
8. Download PDF ticket with QR code

### Admin Panel

- **Dashboard**: Overview statistics
- **Movies**: CRUD operations with image upload
- **Shows**: Schedule management
- **Seats**: Visual preview of bookings
- **Users**: Role management
- **Bookings**: Complete booking history

---

## 🔧 Configuration Files

### Firebase Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Movies - PUBLIC READ
    match /movies/{movieId} {
      allow read: if true;  // Anyone can browse
      allow write: if isAdmin();
      
      match /shows/{showId} {
        allow read: if true;
        allow write: if isAdmin();
        
        match /seats/{seatId} {
          allow read: if true;
          allow update: if isSignedIn();  // Login required to book
          allow create, delete: if isAdmin();
        }
      }
    }
  }
}
```

### Email Service (`emailConfig.js`)

```javascript
export const emailConfig = {
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID'
}
```

---

## 📱 Mobile Responsive Features

All pages are fully mobile-responsive with these optimizations:

### User Pages
- ✅ **SeatSelection.vue** - Seats scale to 35px on mobile, 28px on small screens
- ✅ **PaymentSuccess.vue** - Responsive QR codes and card layouts
- ✅ **Movies.vue** - Grid adapts from 4 columns to 2 to 1
- ✅ **MyBookings.vue** - Cards stack vertically

### Admin Pages
- ✅ **AdminLayout.vue** - Sidebar converts to sticky top navigation
- ✅ **AdminDashboard.vue** - Stats cards stack vertically
- ✅ **AdminBookings.vue** - Table converts to card layout
- ✅ **AdminUsers.vue** - Responsive user management cards
- ✅ **MoviesList.vue** - Grid optimized for mobile
- ✅ **ShowsList.vue** - Full-width cards on mobile
- ✅ **SeatPreview.vue** - Scrollable seat grid on small screens

**Breakpoints:**
- Mobile: < 768px
- Small Mobile: < 480px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🐛 Common Issues & Solutions

### Issue: Firebase Permission Error

**Error:** `Missing or insufficient permissions`

**Solution:** Update Firestore rules to allow public read:
```javascript
match /movies/{movieId} {
  allow read: if true;  // Public access
}
```

### Issue: PWA Registration Error

**Error:** `Uncaught SyntaxError: pwa-register.js`

**Solution:** Remove `<script src="/pwa-register.js"></script>` from index.html

### Issue: Tracking Prevention Warnings

**Status:** Safe to ignore - browser security warnings for localStorage

### Issue: Movies Not Loading

**Solution:** 
1. Check Firebase configuration in `firebase.js`
2. Verify Firestore rules are published
3. Check browser console for errors
4. Clear cache and hard refresh (Ctrl+Shift+R)

---

## 🧪 Testing

### Create Test Users

1. Register a regular user
2. Register an admin user (manually set role in Firestore)
3. Test booking flow as user
4. Test admin features as admin

### Test Scenarios

- [ ] Browse movies without login
- [ ] User registration and login
- [ ] Seat selection and booking
- [ ] Email confirmation received
- [ ] PDF download works
- [ ] Admin can manage movies
- [ ] Admin can view all bookings
- [ ] Mobile responsiveness on all pages

---

## 📊 Database Schema

### Collections

**users**
```javascript
{
  uid: "user123",
  name: "John Doe",
  email: "john@example.com",
  role: "user" | "admin",
  createdAt: Timestamp
}
```

**movies**
```javascript
{
  title: "Movie Title",
  description: "Plot summary",
  duration: "2h 30m",
  language: "English",
  genre: "Action",
  rating: "PG-13",
  poster: "url",
  status: "now-showing" | "coming-soon"
}
```

**movies/{movieId}/shows**
```javascript
{
  date: "2026-02-15",
  time: "7:00 PM",
  price: 500,
  theater: "Hall 1"
}
```

**movies/{movieId}/shows/{showId}/seats**
```javascript
{
  seatNumber: "A1",
  isBooked: false,
  price: 500
}
```

**bookings**
```javascript
{
  userId: "user123",
  movieTitle: "Movie Name",
  showDate: "2026-02-15",
  showTime: "7:00 PM",
  seats: ["A1", "A2"],
  totalPrice: 1000,
  status: "confirmed",
  createdAt: Timestamp
}
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Firebase for backend services
- EmailJS for email integration
- All open-source contributors

---

## 👨‍💻 Author 
**G.D. Jonathan** 
🎓 BSc (Hons) Computer Science – SEUSL 📍 Sri Lanka

---

## ⭐ Star This Repository

If you find this project helpful, please give it a ⭐ on GitHub!
✨ *Thank you for checking out this project!*

---

<div align="center">

### 🎬 **[Try Live Demo](https://moviebookingapp-c495c.web.app/)** 🍿

**Built with ❤️ using Vue.js & Firebase**

![GitHub stars](https://img.shields.io/github/stars/yourusername/cinemax-booking?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/cinemax-booking?style=social)

</div>
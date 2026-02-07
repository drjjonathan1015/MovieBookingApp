# 🎬 CinemaX - Movie Booking Application (Complete Version)

A modern **Progressive Web App (PWA)** for booking movies across theaters. Built with **Vue 3**, **Vite**, **Firebase**, and **Tailwind CSS**, this app allows users to browse movies, select seats, book tickets, view history, and use offline features. Admins can manage movies, shows, and bookings via the admin dashboard.

---

## 🚀 Features

### **User Features**
- User Registration & Login (Email/Password + Google)
- Email verification & password reset
- Browse movies (Now Showing / Coming Soon)
- Filter movies by genre, language, rating
- Search movies by title
- Seat selection for shows
- Download PDF tickets with QR code
- Booking history
- PWA installable & offline ready

### **Admin Features**
- Add/Edit/Delete movies
- Add/Edit/Delete shows
- Manage bookings
- Admin dashboard with role-based access
- Real-time data updates via Firestore

### **UI/UX Enhancements**
- Dark/Light theme toggle
- Responsive mobile-first design
- Loading indicators & error feedback
- Smooth transitions & animations
- User dropdown menu with profile & logout

---

## 📦 Tech Stack

| Category   | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | Vue 3 (Composition API)        |
| Build Tool | Vite                           |
| Styling    | Tailwind CSS                   |
| Backend    | Firebase (Auth + Firestore)    |
| PDF        | jsPDF                          |
| QR Code    | qrcode                         |
| PWA        | Vite PWA Plugin                |

---

## 📁 Project Structure

movie-booking-app/
├── public/
│ └── icons/ (PWA icons)
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── Home.vue
│ │ ├── Movies.vue
│ │ ├── MovieDetails.vue
│ │ ├── SeatSelection.vue
│ │ ├── MyBookings.vue
│ │ ├── Login.vue
│ │ ├── Register.vue
│ │ ├── Profile.vue
│ │ └── NotFound.vue
│ ├── views/
│ │ ├── Admin/
│ │ │ ├── Dashboard.vue
│ │ │ ├── MoviesList.vue
│ │ │ ├── AddMovie.vue
│ │ │ ├── EditMovie.vue
│ │ │ ├── ShowsList.vue
│ │ │ └── EditShow.vue
│ ├── router/
│ │ └── index.js
│ ├── firebase/
│ │ └── firebase.js
│ ├── App.vue
│ └── main.js
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── README.md

---

## 🔧 Installation & Setup

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/your-username/cinemax-movie-booking.git
cd cinemax-movie-booking

2️⃣ Install Dependencies

npm install


3️⃣ Environment Variables
Create .env in project root:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id


⚠️ Never commit .env to Git. Add it to .gitignore:

.env
.env.local
.env.*.local


4️⃣ Run Development Server

npm run dev


5️⃣ Build for Production

npm run build


6️⃣ Firebase Hosting Deployment

npm install -g firebase-tools
firebase login
firebase init
firebase deploy

🔐 Firebase Setup

Collections Structure:

movies

{
  "title": "Movie Title",
  "poster": "url_to_image",
  "language": "English",
  "duration": "2h 30m",
  "genre": "Action",
  "rating": 8.5,
  "description": "Movie description",
  "status": "now showing",
  "releaseDate": "2026-02-01"
}


shows

{
  "movieId": "movie_doc_id",
  "date": "2026-02-10",
  "time": "7:00 PM",
  "price": 200,
  "theater": "Theater 1"
}


seats

{
  "showId": "show_doc_id",
  "seatNumber": "A1",
  "isBooked": false,
  "price": 200
}


bookings

{
  "userId": "user_uid",
  "showId": "show_doc_id",
  "seats": ["A1","A2"],
  "totalPrice": 400,
  "createdAt": "Timestamp"
}


users

{
  "name": "User Name",
  "email": "user@email.com",
  "phone": "+94123456789",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}


Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /movies/{movieId} {
      allow read: if true;
      allow write: if request.auth != null; // add admin check
    }
    match /shows/{showId} {
      allow read: if true;
      allow write: if request.auth != null; // add admin check
    }
    match /seats/{seatId} {
      allow read: if true;
      allow update, create: if request.auth != null;
    }
    match /bookings/{bookingId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}

📱 PWA Support

Add to Home Screen (mobile/desktop)

Offline caching using Workbox

Splash screen & icons

Installable on supported browsers

✅ Testing Checklist

 Register/Login (email + Google)

 Forgot password

 Movie search & filters

 Seat selection

 Booking creation

 PDF download with QR code

 Booking history

 Admin dashboard CRUD

 Theme toggle

 Mobile responsiveness

 Offline caching

🧰 Future Enhancements

Payment gateway integration

SMS/Email notifications

Multi-language support

Push notifications

Admin analytics

Recommendation engine

👨‍💻 Author

G.D. Jonathan
BSc (Hons) Computer Science – SEUSL
Sri Lanka

📄 License

MIT License – For educational & learning purposes.

Enjoy building and using CinemaX! 🎬🚀
const admin = require("firebase-admin");
const moviesData = require("./movies.json");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addMovies() {
  console.log("🎬 Starting to import movies...\n");
  
  for (const movie of moviesData) {
    try {
      // Add movie
      const movieRef = await db.collection("movies").add({
        title: movie.title,
        language: movie.language,
        duration: movie.duration,
        status: movie.status,
        description: movie.description,
        poster: movie.poster,
        genre: movie.genre || "Action",
        rating: movie.rating || null
      });
      console.log(`✅ Movie added: ${movie.title} (ID: ${movieRef.id})`);

      // Add shows subcollection
      for (const show of movie.shows) {
        const showRef = await movieRef.collection("shows").add({
          date: show.date,
          time: show.time,
          price: show.price,
          theater: show.theater || "Screen 1"
        });
        console.log(`  📅 Show added: ${show.date} at ${show.time}`);

        // Generate seats matching SeatSelection.vue layout
        // 10 rows (A-J) x 15 seats per row = 150 seats per show
        // Layout: 5 left + 5 center + 5 right sections
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        const seatsPerRow = 15;
        let seatCount = 0;
        
        for (const row of rows) {
          for (let i = 1; i <= seatsPerRow; i++) {
            // Use consistent field naming: seatNumber and isBooked
            await showRef.collection("seats").doc(`${row}${i}`).set({
              seatNumber: `${row}${i}`,
              isBooked: false,
              price: show.price
            });
            seatCount++;
          }
        }
        console.log(`  💺 ${seatCount} seats created for this show (10 rows x 15 seats)`);
      }
      console.log("");
    } catch (error) {
      console.error(`❌ Error adding movie ${movie.title}:`, error);
    }
  }
  
  console.log("✨ Import completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- Layout: 10 rows (A-J)");
  console.log("- Seats per row: 15 (5 left + 5 center + 5 right)");
  console.log("- Total seats per show: 150");
  console.log("- This matches the SeatSelection.vue layout exactly!");
  
  process.exit(0);
}

addMovies().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
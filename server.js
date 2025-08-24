// server.js
import axios from "axios";
import cron from "node-cron";

const RIVEREXPRESS_URL =
  "https://api.riverexpress.jp/api/v1/expo_event/weekly_available_seats?route=ユニバーサルシティポート→夢洲&date=2025-10-06";

// Replace with your Bark device key
const BARK_KEY = "FH5nvcJAfhz6UuE46CiSCk";
const BARK_API = `https://api.day.app/${BARK_KEY}`;


// Function to check seats
async function checkSeats() {
  try {
    const res = await axios.get(RIVEREXPRESS_URL, {
      headers: { Accept: "application/json" },
    });
    const routes = res.data;

    routes.forEach((route) => {
      route.availability.forEach((day) => {
        if (day.date == '2025-10-06'|| day.date == '2025-10-07') {
          console.log(`Checking ${route.route_id} on ${day.date}: ${day.available_seats} seats`);
          if (day.available_seats > 0) {
            sendBark(
              `Seats available! "https://riverexpress.jp/event/expo-shuttle.html"`,
              `Route ${route.route_id} at ${route.departure_time} has ${day.available_seats} seats on ${day.date}`
            );
          }
        }
      });
    });
  } catch (err) {
    console.error("Error fetching RiverExpress API:", err.message);
  }
}

// Function to send Bark notification
async function sendBark(title, body) {
  try {
    await axios.get(`${BARK_API}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`);
    console.log("✅ Bark sent:", title, body);
  } catch (err) {
    console.error("❌ Bark failed:", err.message);
  }
}

// Run every 10 minutes (cron syntax: "*/10 * * * *")
cron.schedule("*/5 * * * *", () => {
  console.log("⏳ Checking seats...");
  checkSeats();
});

// Run immediately on start too
checkSeats();

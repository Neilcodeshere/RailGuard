require("dotenv").config();
const mongoose = require("mongoose");
const CrackReport = require("./models/CrackReport");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/railway_cracks";

const seedData = [
  {
    latitude: 28.6139,
    longitude: 77.209,
    distance_from_sensor: 12.5,
    timestamp: new Date().toISOString(),
    imageUrl: "https://via.placeholder.com/640x480.png?text=Crack+Detection+1"
  },
  {
    latitude: 28.6145,
    longitude: 77.2105,
    distance_from_sensor: 8.2,
    timestamp: new Date().toISOString(),
    imageUrl: "https://via.placeholder.com/640x480.png?text=Crack+Detection+2"
  }
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for seeding...");
    await CrackReport.deleteMany({});
    await CrackReport.insertMany(seedData);
    console.log("Database seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });

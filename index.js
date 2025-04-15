const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Connect to SQLite DB
const db = new sqlite3.Database("./halowipers_lookup.db", sqlite3.OPEN_READONLY, (err) => {
  if (err) console.error("Failed to connect to DB", err);
  else console.log("Connected to Halowipers database");
});

// Helper to normalize strings
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

// API Endpoint
app.get("/lookup", (req, res) => {
  const { make = "", model = "", year = "" } = req.query;

  const normMake = normalize(make);
  const normModel = normalize(model);
  const normYear = normalize(year);

  const sql = `
    SELECT * FROM wipers
    WHERE REPLACE(LOWER(make), ' ', '') = ?
      AND REPLACE(LOWER(model), ' ', '') = ?
      AND REPLACE(LOWER(year), ' ', '') LIKE ?
    LIMIT 1
  `;

  db.get(sql, [normMake, normModel, `%${normYear}%`], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!row) return res.status(404).json({ message: "Vehicle not found" });

    return res.json({
      make: row.make,
      model: row.model,
      year: row.year,
      driver_blade: row.driver_blade,
      passenger_blade: row.passenger_blade,
      rear_blade: row.rear_blade,
      url: row.url
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚗 Halowipers API running on port ${PORT}`);
});

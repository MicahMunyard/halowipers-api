const sqlite3 = require("sqlite3").verbose();
const path = require("path");

module.exports = async (req, res) => {
  const { make = "", model = "", year = "" } = req.query;

  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]/gi, "");

  const normMake = normalize(make);
  const normModel = normalize(model);
  const normYear = normalize(year);

  const dbPath = path.join(__dirname, "..", "halowipers_lookup.db");
  const db = new sqlite3.Database(dbPath);

  const sql = `
    SELECT * FROM wipers
    WHERE REPLACE(LOWER(make), ' ', '') = ?
      AND REPLACE(LOWER(model), ' ', '') = ?
      AND REPLACE(LOWER(year), ' ', '') LIKE ?
    LIMIT 1
  `;

  db.get(sql, [normMake, normModel, `%${normYear}%`], (err, row) => {
    db.close();
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ message: "Vehicle not found" });

    return res.json({
      make: row.make,
      model: row.model,
      year: row.year,
      driver_blade: row.driver_blade,
      passenger_blade: row.passenger_blade,
      rear_blade: row.rear_blade,
      url: row.url,
    });
  });
};
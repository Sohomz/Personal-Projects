require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");

  // Create table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL
    )
  `;
  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Table 'entries' exists or created successfully");
    }
  });
});

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Handle form submission
app.post("/add", (req, res) => {
  const content = req.body.content;
  connection.query(
    "INSERT INTO entries (content) VALUES (?)",
    [content],
    (err) => {
      if (err) {
        console.error("Error saving data:", err);
        res.status(500).send("Error saving data -- please try again 2");
      } else {
        res.send("Entry added successfully");
      }
    }
  );
});
// // Function to get the next ID
// function getNextId(callback) {
//   connection.query("SELECT MAX(id) AS maxId FROM entries", (err, rows) => {
//     if (err) {
//       callback(err);
//     } else {
//       const nextId = (rows[0].maxId || 0) + 1;
//       callback(null, nextId);
//     }
//   });
// }

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

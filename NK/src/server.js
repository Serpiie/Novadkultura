const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'my_database',
});

function generateUniqueId() {
    return Math.floor(Math.random() * 1000000);
  }
  
// handle login requests
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
    if (results.length === 0) {
      return res.status(401).send('Invalid credentials');
    }
    const user = {
      id: results[0].id,
      username: results[0].username,
      password: results[0].password,
    };
    res.status(200).json(user);
  });
});

// handle register requests
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const sql = `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`;
  const id = generateUniqueId(); // replace with your own method to generate unique IDs
  connection.query(sql, [id, username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
    const user = { id, username, password };
    res.status(200).json(user);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));

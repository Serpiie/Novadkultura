const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create a connection to the database
const connection = mysql.createConnection({
  host: '10.2.67.105',
  user: 'test123',
  password: '12345678',
  database: 'Novadkultura',
});


  
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
  const id = generateUniqueId();
  const sql = `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`;
   // replace with your own method to generate unique IDs
  connection.query(sql, [id, username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
    const user = { id, username, password };
    res.status(200).json(user);
  });
});

app.post('/favorites', (req, res) => {
  const { userId, ObjektaNosaukums, Address } = req.body;

  // Insert the user's favorite attraction into the database
  connection.query('INSERT INTO favorites (userId, ObjektaNosaukums, Address) VALUES (?, ?,?)', [userId, ObjektaNosaukums, Address ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error inserting favorite');
    } else {
      res.send('Favorite added successfully');
    }
  });
});

app.post('/favorites', (req, res) => {
  const { id } = req.params;

  // Get the user's favorite attractions from the database
  connection.query('SELECT * FROM favorites WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving favorites');
    } else {
      res.send(results);
    }
  });
});


app.post('/api/favoriteAttractions', (req, res) => {
  const sql = 'SELECT * FROM favorite_attractions';

  connection.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.json(rows);
  });
});

// DELETE request to remove favorite attraction
app.delete('/api/favoriteAttractions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const sql = 'DELETE FROM favorite_attractions WHERE id = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (result.affectedRows === 0) {
      return res.sendStatus(404);
    }

    res.sendStatus(204);
  });
});



app.listen(3000, () => console.log('Server running on port 3000'));

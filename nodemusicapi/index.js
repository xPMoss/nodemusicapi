
// CRYPTO //
const crypto = require('crypto');
let jwt = require('jsonwebtoken');

// EXPRESS //
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve your css as static
app.use(express.static('public'));

// HTTP //
const http = require('http');
const server = http.createServer(app);

// MYSQL //
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "rammstein",		//här ska namnet på din databas stå
    multipleStatements: true

});

connection.connect(function(err) {	// anslut till databasen
    if (err) throw err;

    console.log("Connected");

});

server.listen(4000, () => {
  console.log('listening on *:4000');
});

// SÄKERHET/HASH PASSWORD //
function hash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  
  return hash.digest('hex');

}

// LOGIN SELECT USER //
app.post('/login', function(req, res) {
  let hashed = hash(req.body.password);

  let sql = `SELECT id, username, firstname, lastname, email FROM users WHERE username='${req.body.username}' AND password='${hashed}'`;

  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    if (result.length > 0) {
      res.json(result);

    }
    else {
      res.sendStatus(401);  // unauthorized

    }

  });
});
  
let validInput = function(data) {
    // returnera true ifall de angivna fälten finns, annars false
    return data.lastname && data.firstname && data.email && data.username && data.password;
}

// SKAPA ANVÄNDARE //
app.post('/users', function(req, res) {
  let hashed = hash(req.body.password);

  if (validInput(req.body)) {
    let sql = `INSERT INTO users(lastname, firstname, email, username, password) values('${req.body.lastname}', '${req.body.firstname}', '${req.body.email}', '${req.body.username}', '${hashed}')`;
      
    connection.query(sql, function(err, result, fields) {
      if (err) throw err;

      var sql = `SELECT id, lastname, firstname, email, username FROM users WHERE username = '${req.body.username}' AND firstname = '${req.body.firstname}'`;
      connection.query(sql, function(err, result, fields) {
        if (err) throw err;
  
        res.json(result);
  
      });

    });
      
      
  }
  else {
    res.sendStatus(422);  // unprocessable entity
  }

});

// UPDATERA ANVÄNDARE //
app.put('/users/:id', function(req, res) {
  let hashed = hash(req.body.password);

  if (validInput(req.body)) {
    let sql = `UPDATE users SET username='${req.body.username}', password='${hashed}', firstname='${req.body.firstname}', lastname='${req.body.lastname}', email='${req.body.email}' WHERE id=${req.params.id}`;

    connection.query(sql, function(err, result, fields) {
      if (err) throw err;

      var sql = `SELECT id, lastname, firstname, email, username FROM users WHERE id = '${req.params.id}'`;
      connection.query(sql, function(err, result, fields) {
        if (err) throw err;
        
        if(result.length < 1){
          res.sendStatus(204);  // No Content
    
        }
        else{
          res.json(result);
        }
        
  
      });

    });
  }
  else {
      res.sendStatus(422); // unprocessable entity
  }

});

// TA BORT ANVÄNDARE //
app.delete('/users/:id', function(req, res) {
  let sql = `DELETE FROM users WHERE id=${req.params.id}`;
  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    res.json(result);
    

  });

});

// GET USERS //
app.get('/users', function(req, res) {
  var sql = "SELECT id, username, firstname, lastname, email FROM users";
  if(req.query.id) {
    sql += " WHERE id=" + req.query.id;
  }
  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    if(result.length > 0){
      res.json(result);

    }
    else{
      res.sendStatus(204);  // No Content

    }

  });
});

// GET MEMBERS //
app.get('/members', function(req, res) {
  var sql = "SELECT id, firstname, lastname, role FROM members";
  
  if(req.query.id) {
    sql += " WHERE id=" + req.query.id;
  }

  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    if(result.length > 0){
      res.json(result);

    }
    else{
      res.sendStatus(204);  // No Content

    }
    
  });
}); 

// GET ALBUMS //
app.get('/albums', function(req, res) {
  var sql = "SELECT id, name, year FROM albums";

  if(req.query.id) {
    sql += " WHERE id=" + req.query.id;
  }

  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    if(result.length > 0){
        res.json(result);

    }
    else{
      res.sendStatus(204);  // No Content

    }
    
  });
}); 

// GET SONGS //
app.get('/songs', function(req, res) {
  var sql = "SELECT id, album_id, name, name_eng, length, album FROM songs";

  if(req.query.album_id) {
    sql += " WHERE album_id=" + req.query.album_id;
  }

  if(req.query.id) {
    sql += " WHERE id=" + req.query.id;
  }

  connection.query(sql, function(err, result, fields) {
    if (err) throw err;

    if(result.length > 0){
      res.json(result);

    }
    else{
      res.sendStatus(204);  // No Content

    }

  });
});

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});


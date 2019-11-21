// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');

// create and configure the express app
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Database Connection Info
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://lhgUser:3BF5ndJ9Bhyf@linkedhub-game-y2y54.mongodb.net/test?retryWrites=true&w=majority';
let db;

// The index route
app.get('/', function(req, res) {
  res.send('LHG Leaderboard API!');
});

// Route to create new player
app.post('/players', async function(req, res) {
  // get information of player from POST body data
  let { username, score } = req.body;

  // check if the username already exists
  const alreadyExisting = await db
    .collection('players')
    .findOne({ username: username });

  if (alreadyExisting) {
    res.send({ status: false, msg: 'player username already exists' });
  } else {
    // create the new player
    await db.collection('players').insertOne({ username, score });
    console.log(`Created Player ${username}`);
    res.send({ status: true, msg: 'player created' });
  }
});

// Route to update score
app.put('/players', async function(req, res) {
  let { username, score } = req.body;
  // check if the username already exists
  const alreadyExisting = await db
    .collection('players')
    .findOne({ username: username });
  if (alreadyExisting) {
    // Update player object with the username
    await db
    .collection('players')
    .updateOne({ username }, { $set: { username, score } });

    console.log(`Player ${username} score updated to ${score}`);
    res.send({ status: true, msg: 'player score updated' });
  } else {
    res.send({ status: false, msg: 'player username not found' });
  }
});


// delete player
app.delete('/players', async function(req, res) {
  let { username, score } = req.body;
  // check if the username already exists
  const alreadyExisting = await db
    .collection('players')
    .findOne({ username: username });

  if (alreadyExisting) {
    await db.collection('players').deleteOne({ username });
    console.log(`Player ${username} deleted`);
    res.send({ status: true, msg: 'player deleted' });
  } else {
    res.send({ status: false, msg: 'username not found' });
  }
});

// Access the leaderboard
app.get('/players', async function(req, res) {
  // retrieve ‘lim’ from the query string info
  let { lim } = req.query;
  db.collection('players')
  .find()
  // -1 is for descending and 1 is for ascending
  .sort({ score: -1 })
  // Show only [lim] players
  .limit(5)
  .toArray(function(err, result) {
    if (err) {
      res.send({ status: false, msg: 'failed to retrieve players' });
    }
    console.log(Array.from(result));
    res.send({ status: true, msg: result });
  });
});

// Connect to the database
(async () => {
  let client = await MongoClient.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );

  db = client.db('Players');

  app.listen(PORT, async function() {
    console.log(`Listening on Port ${PORT}`);
    if (db) {
      console.log('Database is Connected!');
    }
  });
})();

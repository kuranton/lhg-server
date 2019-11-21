// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');

// create and configure the express app
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Database Connection Info
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://lhgUser:3BF5ndJ9Bhyf@linkedhub-game-y2y54.mongodb.net/test?retryWrites=true&w=majority';
let db;

// The index route
app.get('/', function(req, res) {
  res.send('LHG Leaderboard API!');
});

// Route to create new player
app.post('/players', wrapAsync(async function(req, res) {
  // get information of player from POST body data
  let { username, score } = req.body;

  // check if username is present
  if (!username) {
    return res.status(400).send({
      message: 'no username'
    });
  }

  //check if username is too long
  if (`${username}`.length > 30) {
    return res.status(400).send({
      message: 'username shouldn\'t be longer than 30 characters'
    });
  }

  // check if score is number
  if (typeof score !== 'number' || isNaN(score)) {
    return res.status(400).send({
      message: 'score should be a number'
    });
  }

  // insert player
  await db.collection('players').insertOne({ username, score });
  return res.send({
    message: 'successfully saved score'
  });
}));

// Get leaderboard
app.get('/players', wrapAsync(async function(req, res) {
  db.collection('players').find({}).project({ _id: 0 }).sort({ score: -1 }).limit(5)
  .toArray(function(err, result) {
    if (err) {
      res.status(500).send({ message: 'failed to retrieve players' });
    }
    console.log(Array.from(result));
    res.send({ result });
  });
}));

// Error middleware
app.use(function (err, req, res, next) {
  res.status(500).json({ message: err.message });
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

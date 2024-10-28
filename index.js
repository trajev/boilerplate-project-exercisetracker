const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let users = [];
let userExercises = [];

app.post("/api/users", (req, res) => {
  const randomId = uuidv4();
  let userObj = { _id: randomId, ...req.body };
  users.push(userObj);

  userExercises.push({
    _id: randomId,
    username: req.body.username,
    logs: [],
    count: 0
  });

  res.json(userObj);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let date = req.body.date ? new Date(req.body.date) : new Date();
  let options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
  let modifiedDate = date.toLocaleDateString('en-US', options).replaceAll(',', '');

  let userExerciseObj = userExercises.find(item => item._id === req.params._id);
  if (!userExerciseObj) {
    return res.status(404).json({ error: 'User not found' });
  }

  let logsArr = userExerciseObj.logs;
  logsArr.push({ description: req.body.description, duration: Number(req.body.duration), date: modifiedDate });

  userExerciseObj.logs = logsArr;
  userExerciseObj.count = logsArr.length;

  let resObj = {
    username: userExerciseObj.username,
    description: req.body.description,
    duration: Number(req.body.duration),
    date: modifiedDate,
    _id: userExerciseObj._id
  };

  res.json(resObj);
});

app.get("/api/users/:_id/logs", (req, res) => {
  let userExerciseObj = userExercises.find(item => item._id === req.params._id);
  if (!userExerciseObj) {
    return res.status(404).json({ error: 'User not found' });
  }

  let logs = userExerciseObj.logs;
  let { from, to, limit } = req.query;

  if (from || to) {
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();
    logs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= fromDate && logDate <= toDate;
    });
  }

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({
    username: userExerciseObj.username,
    count: logs.length,
    _id: userExerciseObj._id,
    log: logs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: log.date,
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

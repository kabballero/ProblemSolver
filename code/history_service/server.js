const express = require('express');
//const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
//const fs = require('fs');
const con =require('./database')
const ProblemModel = require('./problem');

const bodyParser = require('body-parser');
const app = express();
app.use(cors());
const port = 3010;

//const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/user_history/:userid', async (req, res) => {
    const userId = req.params.userid;
  try {
    const problems = await ProblemModel.find({ usersid: userId });
    if (problems.length > 0) {
      res.status(200).json(problems);
    } else {
      res.status(404).json({ message: "No problems found for this user ID" });
    }
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`History service is running on port ${port}`);
});
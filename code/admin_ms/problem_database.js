const mongoose = require('mongoose');

const uri = "mongodb+srv://exarxos928:12345@cluster0.s7y42um.mongodb.net/toulou2?retryWrites=true&w=majority&appName=Cluster0";
// const uri = "mongodb://mongodb:27017/toulou2";

const con_problem = mongoose.createConnection(uri, {});

// Event listener for successful connection
con_problem.on('connected', () => {
  console.log('Connected to problems database');
  console.log('Current database:', con_problem.name); // Print the name of the current database
});

// Event listener for connection errors
con_problem.on('error', (error) => {
  console.error('Error connecting to problems database:', error);
});

module.exports = con_problem;

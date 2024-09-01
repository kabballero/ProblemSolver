const mongoose=require('mongoose')

const uri = "mongodb+srv://exarxos928:12345@cluster0.s7y42um.mongodb.net/toulou2?retryWrites=true&w=majority&appName=Cluster0";
//const uri = "mongodb://mongodb:27017/toulou2";

const con = mongoose.connect(uri, {});

const db = mongoose.connection;

// Event listener for successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB');
  console.log('Current database:', db.name); // Print the name of the current database
});
  
  con.then(() => {
    console.log("Database Connected");
  }).catch(error => {
    console.error("Error connecting to MongoDB:", error);
  });
  
  module.exports = con;
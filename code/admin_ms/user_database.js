const mongoose = require('mongoose');

// MongoDB URI for user management
const uri = "mongodb+srv://user:123@usermanagement.l8yucz1.mongodb.net/user_management?retryWrites=true&w=majority&appName=UserManagement";

const con_user = mongoose.createConnection(uri, {});

// Event listener for successful connection
con_user.on('connected', () => {
  console.log('Connected to users database');
  console.log('Current database:', con_user.name); // Print the name of the current database
});

// Event listener for connection errors
con_user.on('error', (error) => {
  console.error('Error connecting to users database:', error);
});

module.exports = con_user;

const mongoose=require('mongoose')
const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    credits: Number,
  });
  
module.exports = mongoose.model("users", userSchema);
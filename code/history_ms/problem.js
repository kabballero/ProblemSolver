const mongoose=require('mongoose')
const problemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    usersid: String,
    problemsinput: [],
    solution: [],
    date: {
      type: Date,
      default: Date.now 
  }
  });
  
module.exports = mongoose.model("problem", problemSchema);
const mongoose=require('mongoose')
const problemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    usersid: String,
    problemsinput: [],
    solution: [] 
  });
  
module.exports = mongoose.model("problem", problemSchema);
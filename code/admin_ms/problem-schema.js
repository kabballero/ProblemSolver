const mongoose=require('mongoose')

const problemInputSchema = new mongoose.Schema({
  locations: [
    {
      Latitude: Number,
      Longitude: Number
    }
  ],
  num_vehicles: String, 
  depot: String,
  max_distance: String 
}, { _id: false });

const problemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    usersid: String,
    problemsinput: [problemInputSchema],
    solution: [],
    date: {
      type: Date,
      default: Date.now 
  }
  });

module.exports = (connection) => connection.model("problem", problemSchema);
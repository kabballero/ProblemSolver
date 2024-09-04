const http=require('http')
const express=require('express')
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const con =require('./database')
const UserModel = require('./user');

const port=9103;

app.use(cors());
//con.then(() => {
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
  });

app.get('', (req,res)=>{
    res.send('hi dude')
});

app.get('/users', async(req,res)=>{
    try {
        //const userId = new mongoose.Types.ObjectId('663385e0aff12a03431cec8e');
        const userData = await UserModel.find();
        res.json(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

app.get('/sell/:id/:amount', async(req,res)=>{
  try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const amount = parseInt(req.params.amount);
      const userData = await UserModel.find({_id: userId});
      await UserModel.updateOne({ _id: userId }, { $inc: { credits: amount } });
      const updatedUser = await UserModel.findById(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
})
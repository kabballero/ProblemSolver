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
        const userData = await UserModel.find();
        res.json(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
//});
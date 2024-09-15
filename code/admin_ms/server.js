const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const user_con = require('./user_database')
const UserModel = require('./userSchema');
const problem_con = require('./problem_database')
const ProblemModel = require('./problem-schema');

const User = UserModel(user_con);
const Problem = ProblemModel(problem_con);


const app = express();
app.use(cors());
const port = 4200;

app.listen(port, async () => {
    console.log(`admin's server running on:${port}`);

});

app.get('/problemsID/:problemsid', async (req, res) => {
    try {
        const problemsId = new mongoose.Types.ObjectId(req.params.problemsid.slice(1, -1));
        const problemData = await Problem.find({ _id: problemsId });
        res.send(problemData);
    } catch (error) {
        res.status(500).send('error in fetching problems with problems id');
    }
})

app.get('/problemsUsername/:username/:num_vehicles/:max_distance/:depot/:locations/:solved', async (req, res) => {
    try {
        const query={};
        if (req.params.username !== 'undefined') {
            const user = await User.findOne({ username: req.params.username });
            if (!user) {
                return res.status(404).send('User not found');
            }
            query['usersid']= user._id.toString();
        }
        //console.log(userID)
        if (req.params.num_vehicles !== 'undefined') {
            query['problemsinput.num_vehicles'] = req.params.num_vehicles;
        }
        if (req.params.max_distance !== 'undefined') {
            query['problemsinput.max_distance'] = req.params.max_distance;
        }
        if (req.params.depot !== 'undefined') {
            query['problemsinput.depot'] = req.params.depot;
        }
        if (req.params.locations!== 'undefined') {
            query['problemsinput.locations'] = { $size: parseInt(req.params.locations) };
        }
        if(req.params.solved==1){
            query['solution'] = {$ne: []}
        }
        if(req.params.solved==0){
            query['solution'] = {$size: 0}
        }
        const problemData = await Problem.find(query)
        console.log(query)
        res.send(problemData);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({},{username: 1,_id: 0});
        res.send(users);
    } catch (error) {
        res.status(500).send('error in finding users');
    }
})
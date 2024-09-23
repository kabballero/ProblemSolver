const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const con = require('./database')
const ProblemModel = require('./problem');
const path = require('path');

const bodyParser = require('body-parser');
const submit = require('./submit'); // Import the RabbitMQ functions
const app = express();
app.use(cors());
const port = 3100;

const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/submit', upload.single('locationsFile'), async (req, res) => {
    const { num_vehicles, depot, max_distance, userID } = req.body;  // Extract other form data
    let locations;
    if (req.file) {
        // If a file is uploaded, read and parse it
        try {
            const data = fs.readFileSync(req.file.path);
            const json = JSON.parse(data);
            locations = json.Locations;
            // Optionally delete the file after processing
            fs.unlinkSync(req.file.path);
        } catch (error) {
            fs.unlinkSync(req.file.path);  // Clean up the uploaded file
            console.error("Error processing file:", error);
            return res.status(500).send("Failed to process file.");
        }
    } else {
        // Handle case where no file is uploaded if necessary
        console.log("No file uploaded");
        return res.status(400).send("No file uploaded.");
    }

    const problemData = {
        locations,
        num_vehicles,
        depot,
        max_distance
    };

    //console.log(problemData);  // Log the received data to verify

    try {
         // Assume submit.sendProblemData is an async function you've defined elsewhere
         await submit.sendProblemData(problemData);
         try{
             const newObjectId = new mongoose.Types.ObjectId();
             const newProblemModel = new ProblemModel({
                 _id: newObjectId,
                 usersid: userID,
                 problemsinput: problemData,
                 solution: []
             });
             newProblemModel.save()
                 .then(savedProblem => {
                     console.log('Problem saved successfully:', savedProblem);
                 })
                 res.send(newObjectId);
         } catch (error) {
             console.error("Failed to stote problem:", error);
             res.status(500).send("Failed to stote problem.");
        } 
    }catch (error) {
            console.error("Failed to send problem data:", error);
            res.status(500).send("Failed to submit problem.");
        }
}
);

app.get('/solution/:problemsid', async (req, res) => {
    try {
        //await submit.listenForSolutions();
        const message = await submit.listenForSolutions();
        //console.log("Received message:", message);
        //console.log(message)
        const answer = JSON.parse(message);
        const problemsId =new mongoose.Types.ObjectId(req.params.problemsid.slice(1,-1));
        const problemData = await ProblemModel.find({_id: problemsId});
        await ProblemModel.updateOne({ _id: problemsId }, {solution: answer });
        //console.log(answer);
        if(answer==='No solution found. Try different parameters.'){
            res.status(403).send({message: 'No solution found. Try different parameters.'})
        }else 
            res.send(answer);
        //console.log(answer);
    } catch (error) {
        console.error("Failed to start listening for solutions:", error);
}})

app.get('/getsolution/:problemsid', async (req, res) => {
    try {
        const problemsId = new mongoose.Types.ObjectId(req.params.problemsid.slice(1, -1));
        const problemData = await ProblemModel.find({ _id: problemsId });
        res.send(problemData);
    } catch (error) {
        console.error("Failed get the data:", error);
    }
})

app.delete('/deleteQueue', async (req, res) => {
   try{ 
    await submit.sendDeleteSignal();
    const result = await submit.deleteQueue1();
    res.status(200).send({ message: `sent delete signal`, result });
   }
   catch(error){
    res.status(500).send({ message: `Failed to sent delete signal`, error: error.message });
   }
});


// Start the server and immediately begin listening for solutions
app.listen(port, async () => {
    console.log(`Server running on http://submit_new_problem_service:${port}`);
});

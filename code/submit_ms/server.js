const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const fs = require('fs');
const con = require('./database')
const ProblemModel = require('./problem');
require('dotenv').config({ path: '../.env' });

const bodyParser = require('body-parser');
const submit = require('./submit'); // Import the RabbitMQ functions
const app = express();
app.use(cors());
const port = 3100;

let pythonProcess = null;

const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//when local run
// Serve the HTML file on the homepage route
//const path = require('path');
//app.use(express.static(path.join(__dirname, '..', 'frontend')));
//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
//});



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

    //console.log(problemData);  // Log the received data to verify


    // Assume submit.sendProblemData is an async function you've defined elsewhere
    //await submit.sendProblemData(problemData);
    try {
        const newObjectId = new mongoose.Types.ObjectId();
        const problemData = {
            newObjectId,
            locations,
            num_vehicles,
            depot,
            max_distance
        };
        const newProblemModel = new ProblemModel({
            _id: newObjectId,
            usersid: userID,
            problemsinput: problemData,
            solution: []
        });
        await newProblemModel.save()
            .then(savedProblem => {
                console.log('Problem saved successfully:', savedProblem);
            })
        try {
            await submit.sendProblemData(problemData, newObjectId);
        }
        catch (error) {
            console.error("Failed to send problem data:", error);
            res.status(500).send("Failed to submit problem.");
        }
        res.send(newObjectId);
    } catch (error) {
        console.error("Failed to stote problem:", error);
        res.status(500).send("Failed to stote problem.");
    }
}
);

app.get('/solution/:problemsid', async (req, res) => {
    try {
        //await submit.listenForSolutions();
        const message = await submit.listenForSolutions();
        //console.log("Received message:", message);
        //console.log(message)
        if (message.solution == 'cancelled') {
            //console.log('hi')
            const problemsId = new mongoose.Types.ObjectId(req.params.problemsid.slice(1, -1));
            try {
                const result = await ProblemModel.deleteOne({ _id: problemsId });
                if (result.deletedCount > 0) {
                    console.log('Document deleted successfully');
                } else {
                    console.log('No document found to delete');
                }
            } catch (err) {
                console.error('Error deleting the document:', err);
            }
        }
        else {
            const answer = JSON.parse(message);
            console.log(answer.solution)
            const problemsId = new mongoose.Types.ObjectId(answer.problemID)//new mongoose.Types.ObjectId(req.params.problemsid.slice(1, -1));
            const problemData = await ProblemModel.find({ _id: problemsId });
            await ProblemModel.updateOne({ _id: problemsId }, { solution: answer.solution });
            //console.log(answer.solution);
            if (answer.solution === 'No solution found. Try different parameters.') {
                res.status(403).send({ message: 'No solution found. Try different parameters.' })
            }
            else
                res.send(answer);
            //console.log(answer);
        }
    } catch (error) {
        console.error("Failed to start listening for solutions:", error);
    }
})

app.get('/getsolution/:problemsid', async (req, res) => {
    try {
        const problemsId = new mongoose.Types.ObjectId(req.params.problemsid.slice(1, -1));
        const problemData = await ProblemModel.find({ _id: problemsId });
        res.send(problemData);
    } catch (error) {
        console.error("Failed get the data:", error);
    }
})

function startPythonScript() {
    console.log("Starting Python script...");
    pythonProcess = spawn('python', ['../solve_ms/main_program.py']);  // Adjust the path to your script

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

    pythonProcess.on('error', (err) => {
        console.error('Failed to start Python script:', err);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });
}

app.delete('/deleteQueue', async (req, res) => {
    try {
        const result = await submit.deleteQueue();
        console.log('Queue deleted successfully:', result);

        if (pythonProcess) {
            console.log("Stopping Python script...");
            pythonProcess.kill();  // Kill the Python process
            pythonProcess.on('exit', (code) => {
                console.log(`Python process exited with code ${code}. Restarting...`);

                // Start a new Python process once the old one has exited
                startPythonScript();
            });
        } else {
            console.log("No Python process found. Starting a new one...");
            console.log("No Python process found. Starting a new one...");
            startPythonScript();  // Start Python script if it wasn't running
        }

        // Send a single success response after all actions are completed
        res.status(200).send({ message: `Queues deleted and Python script restarted successfully`, result });

    } catch (error) {
        // Catch any error from either the queue deletion or Python process handling
        res.status(500).send({ message: `Failed to delete queues or restart Python script`, error: error.message });
    }
});


// Start the server and immediately begin listening for solutions
app.listen(port, async () => {
    console.log(`Server running on http://submit_new_problem_service:${port}`);
    startPythonScript();
});

const express = require('express');
const multer = require('multer');
const fs = require('fs');

const bodyParser = require('body-parser');
const submit = require('./submit'); // Import the RabbitMQ functions
const app = express();
const port = 3000;

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
    const { num_vehicles, depot, max_distance } = req.body;  // Extract other form data
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
        await submit.sendProblemData(problemData);
        res.send("Problem submitted successfully!");
        try {
            await submit.listenForSolutions();
        } catch (error) {
            console.error("Failed to start listening for solutions:", error);
        }
    } catch (error) {
        console.error("Failed to send problem data:", error);
        res.status(500).send("Failed to submit problem.");
    }
});

// Start the server and immediately begin listening for solutions
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    
});

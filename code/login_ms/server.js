const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb'); // Ensure ObjectId is imported

const app = express();
const port = 3001;

const uri = "mongodb+srv://user:123@usermanagement.l8yucz1.mongodb.net/?retryWrites=true&w=majority&appName=UserManagement";
const client = new MongoClient(uri);
const dbName = "user_management";
let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("Connected to database");
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1);
    }
}

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await db.collection("users").findOne({ username });

        if (user && user.password === password) {
            res.json({ success: true, user_id: user._id, username: user.username, credits: user.credits });
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        next(err);
    }
});

app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        await db.collection("users").insertOne({ username, email, password, credits: 0 });
        res.json({ success: true, message: "User registered successfully" });
    } catch (err) {
        next(err);
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const user = await db.collection("users").findOne({ _id: userId });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/buy/:id/:creditsToBuy', async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const creditsToBuy = parseInt(req.params.creditsToBuy, 10);

        const result = await db.collection("users").updateOne(
            { _id: userId },
            { $inc: { credits: creditsToBuy } }
        );

        if (result.modifiedCount === 1) {
            const updatedUser = await db.collection("users").findOne({ _id: userId });
            res.json({ success: true, newCredits: updatedUser.credits });
        } else {
            res.json({ success: false, message: "Failed to update credits" });
        }
    } catch (err) {
        console.error('Error purchasing credits:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

connectToDatabase().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
});
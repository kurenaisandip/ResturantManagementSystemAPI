import express from "express";
import cors from "cors";
import connectDB from "./src/db.js";

const app = express();

try {
    connectDB().then(r => console.log("Connected to database"));
}catch (e) {
    console.log("cannot connect with database:", e);
}

// Global middleware
app.use(cors());
app.use(express.json());


// Custom Middleware
const requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    console.log("Middleware executed");
    next();
}

// make this middleware global
app.use(requestTime);

// make this middleware local to the request
app.get("/", requestTime, (req, res) => {
    res.status(500).json({message: "Hello World"}); // this is method chaining
    // res.send("Hello World");
})


app.get("/", (req, res) => {
    res.status(500).json({message: "Hello World"}); // this is method chaining
    // res.send("Hello World");
})

// Error Handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({message: "Internal Server Error"});
})


const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


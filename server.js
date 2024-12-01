import express from "express";
import cors from "cors";
import {connectDB} from "./src/config/db.js";
import UserRouter from "./src/routes/user_routes.js";
import dotenv from "dotenv";
import RestaurantRouter from "./src/routes/restaurant_routes.js";

const app = express();

try {
    connectDB().then(r => console.log("Connected to database"));
}catch (e) {
    console.log("cannot connect with database:", e);
}

// Global middleware
app.use(cors());
app.use(express.json());

dotenv.config();



// Custom Middleware
const requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    console.log("Middleware executed");
    next();
}

//Routes
app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to  apis" });
});

app.use('/api/users', UserRouter);
app.use('/api/restaurants', RestaurantRouter);

// make this middleware local to the request



// app.get("/", (req, res) => {
//     res.status(500).json({message: "Hello World"}); // this is method chaining
//     // res.send("Hello World");
// })

// Error Handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({message: "Internal Server Error"});
})


const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


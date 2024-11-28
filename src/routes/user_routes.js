import express from "express";
import {User} from "../models/users.js";
import bycypt from "bcrypt";
import {connectDB} from "../config/db.js";
import {db} from "../config/db.js";
// import {ConnectionStates} from "mongoose";


const UserRouter = express.Router();


UserRouter.post("/signup", async (req, res, next) => {
    const {name, email, phone_number, password} = req.body;

// validate request -> express validator
    if (!name || !email || !phone_number || !password) {
        return res.status(400).json({message: "All fields are required"});
    }

    const salt = await bycypt.genSalt(10);
    const hashedPassword = await bycypt.hash(password, salt);

    console.log(name, email, phone_number, password);

    const result = await db.query('INSERT INTO users (username, email, phone_number, password) VALUES (?, ?, ?,?)',
        [name, email, phone_number,  hashedPassword]);

    console.log(result);

    res.status(201).json({id: result._id});

});

UserRouter.post("/login", async (req, res, next) => {

    const {email, password} = req.body;

    const user = await User.findOne({

    });

    if (!user){
        const error = new Error("User not found");
        error.statusCode = 404;
        next();
        return;
    }

    const isPasswordValid = await bycypt.compareSync(password, user.password);

    if (!isPasswordValid){
        const error = new Error("Invalid password");
        error.statusCode = 401;
        next();
        return;
    }

});
export default UserRouter;
import express from "express";
import {User} from "../models/users.js";
import bycypt from "bcrypt";
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

    const result = await User.create({
        name,
        email,
        phone_number,
        password : hashedPassword,
    });

    console.log(result);

    res.status(201).json({id: result._id});

});

UserRouter.post("/login", async (req, res, next) => {



});
export default UserRouter;
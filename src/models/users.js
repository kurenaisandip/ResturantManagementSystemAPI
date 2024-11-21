import mongoose from "mongoose";
import * as string_decoder from "node:string_decoder";

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone_number: {
            type: Number,
            required: true,
        },
        password: {
            type: String,
            required: true,
        }
    }, {timestamps: true}
);

export const User = mongoose.model("User", userSchema);
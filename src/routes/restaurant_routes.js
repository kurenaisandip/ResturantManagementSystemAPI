import express from "express";
import bycypt from "bcrypt";
import {db} from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const RestaurantRouter = express.Router();

RestaurantRouter.post("/signup", async (req, res, next) => {
    const {name, email, phone_number, password} = req.body;

// validate request -> express validator
    if (!name || !email || !phone_number || !password) {
        return res.status(400).json({message: "All fields are required"});
    }

    const salt = await bycypt.genSalt(10);
    const hashedPassword = await bycypt.hash(password, salt);

    console.log(name, email, phone_number, password);

    const result = await db.query('INSERT INTO restaurants_users  (restaurant_name , email, password, phone_number, role_id) VALUES (?, ?, ?,?, ?)', [name, email, hashedPassword, phone_number, 3]);

    console.log(result);

    res.status(201).json({id: result[0].insertId});
});

/**
 *
 * @param {string} username
 * @param {string} email
 * @param {int} id
 * @param {string} role
 * @param {int} phone_number
 * @returns {*}
 */

function generateAccessToken(username, email, id, role, phone_number) {
    const payLoad = {
        restaurant_name: username, email: email, restaurant_id: id, role: role, phone_number: phone_number
    }
    return jwt.sign(payLoad, process.env.TOKEN_SECRET, {expiresIn: '1800s'});
}

RestaurantRouter.post("/login", async (req, res, next) => {

    const {email, password} = req.body;

    const user = await db.query('SELECT 1 FROM restaurants_users WHERE email = ?', [email]);

    if (!user) {
        const error = new Error("Resturant not found");
        error.statusCode = 404;
        next();
        return;
    }

    const [existingUser] = await db.query('SELECT * FROM restaurants_users WHERE email = ?', [email]);

    const isPasswordValid = await bycypt.compareSync(password, existingUser[0].password);

    if (!isPasswordValid) {
        const error = new Error("Invalid password");
        error.statusCode = 401;
        next();
        return;
    }

    crypto.randomBytes(64).toString('hex');

    const query = `
        SELECT u.restaurant_id as id, u.email, u.restaurant_name as name, u.phone_number, r.name as role
        FROM restaurants_users AS u
                 JOIN roles AS r ON r.id = u.role_id
        WHERE u.email = ?;
    `;

    const [userData] = await db.query(query, [email]);

    console.log(userData);
    console.log(query);
    console.log(userData[0]);

    console.log(userData[0].name, userData[0].email, userData[0].id, userData[0].role);

    const token = generateAccessToken(userData[0].name, userData[0].email, userData[0].id, userData[0].role, userData[0].phone_number);

    res.status(200).json(token);
});

RestaurantRouter.put("/update/:id", async (req, res, next) => {
    const id = req.params.id;
    const {restaurant_name, email, phone_number, address, description, start_time, end_time, banner, image} = req.body;

    // Validate input
    if (!restaurant_name || !email || !phone_number || !address || !description || !start_time || !end_time || !banner || !image) {
        return res.status(400).json({message: "All fields are required"});
    }

    // Update query
    const updateQuery = `
        UPDATE restaurants_users
        SET restaurant_name = ?,
            email           = ?,
            address         = ?,
            description     = ?,
            start_time      = ?,
            end_time        = ?,
            banner          = ?,
            image           = ?,
            phone_number    = ?
        WHERE restaurant_id = ?;
    `;

    try {
        // Execute the update query
        const [result] = await db.query(updateQuery, [restaurant_name, email, address, description, start_time, end_time, banner, image, phone_number, id]);

        // Checking the affected rows
        if (result.affectedRows === 0) {
            // No rows were updated (restaurant not found or no changes)
            return res.status(404).json({
                error: "Restaurant not found",
                message: "No restaurant found with the given ID or no changes were made."
            });
        }

        // Successful update
        res.status(200).json({
            message: "Restaurant updated successfully"
        });

    } catch (error) {
        // Handle unexpected errors
        next(error);
    }
});

/**
 * @param {string} menu_name
 * @param {decimal} price
 * @param {string} description
 * @param {string} image
 * @param {int} restaurant_id
 * @returns {*}
 */

RestaurantRouter.post("/add_menu", async (req, res, next) => {
    try {
        const {menu_name, price,description, image, restaurant_id} = req.body;

        console.log(menu_name, price, description, image, restaurant_id);


       const result = await db.query('INSERT INTO menus (menu_name, price, description, image, restaurant_id) VALUES (?, ?, ?, ?, ?)', [menu_name, price, description, image, restaurant_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Restaurant couldn't be created."});
        }

        res.status(200).json({restaurant_id: result[0].insertId});

    } catch (error) {
        next(error);
    }
});

RestaurantRouter.post("/add_table", async  (req, res, next) => {
  const {restaurant_id, table_name, booking_status, description, image, price, table_size } = req.body;

  console.log(restaurant_id, table_name, booking_status, description, image, price, table_size);
  const result = await db.query('INSERT INTO restaurant_tables (restaurant_id, table_name, booking_status, description, image, price, table_size) VALUES (?, ?, ?, ?, ?, ?, ?)', [restaurant_id, table_name, booking_status, description, image, price, table_size]);

  if (result.affectedRows === 0) {
    return res.status(404).json({message: "Table couldn't be created."});
  }

  res.status(200).json({table_id: result[0].insertId});

});



export default RestaurantRouter;
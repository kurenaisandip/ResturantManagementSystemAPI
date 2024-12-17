import express from "express";
import bycypt from "bcrypt";
import {db} from "../config/db.js";
import jwt from 'jsonwebtoken';
import crypto from "node:crypto";
import {randomBytes} from "pg/lib/crypto/utils-legacy.js";


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

    const result = await db.query('INSERT INTO users (username, email, phone_number, password, role_id) VALUES (?, ?, ?,?, ?)',
        [name, email, phone_number, hashedPassword, 2]);

    console.log(result);

    res.status(201).json({id: result[0].insertId});
});

/**
 *
 * @param {string} username
 * @param {string} email
 * @param {int} id
 * @param {string} role
 * @returns {*}
 */

function generateAccessToken(username, email, id, role) {
    const payLoad = {
        username: username,
        email: email,
        id: id,
        role: role
    }
    return jwt.sign(payLoad, process.env.TOKEN_SECRET, {expiresIn: '1800s'});
}

UserRouter.post("/login", async (req, res, next) => {

    const {email, password} = req.body;

    const user = await db.query('SELECT 1 FROM users WHERE email = ?', [email]);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        next();
        return;
    }

    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    const isPasswordValid = await bycypt.compareSync(password, existingUser[0].password);

    if (!isPasswordValid) {
        const error = new Error("Invalid password");
        error.statusCode = 401;
        next();
        return;
    }

    crypto.randomBytes(64).toString('hex');

    const query = `
        SELECT u.id, u.email, u.username, r.name as role
        FROM users AS u
                 JOIN roles AS r ON r.id = u.role_id
        WHERE u.email = ?;
    `;

    const [userData] = await db.query(query, [email]);

    console.log(userData);
    console.log(query);
    console.log(userData[0]);

    console.log(userData[0].username, userData[0].email, userData[0].id, userData[0].role);

    const token = generateAccessToken(userData[0].username, userData[0].email, userData[0].id, userData[0].role);

    res.status(200).json(token);


});

UserRouter.get("/all_restaurants", async (req, res, next) => {
    const query = `SELECT r.restaurant_id                        AS id,
                          r.restaurant_name                      AS name,
                          r.address,
                          COUNT(t.table_id)                      AS tables,
                          -- Merging start_time and end_time into a single column
                          CONCAT(
                                  CONCAT(
                                          CASE
                                              WHEN HOUR (r.start_time) > 12 THEN CONCAT(HOUR(r.start_time) - 12, ':', LPAD(MINUTE(r.start_time), 2, '0'), ' PM')
                        WHEN HOUR(r.start_time) = 0 THEN CONCAT(12, ':', LPAD(MINUTE(r.start_time), 2, '0'), ' AM')
                        ELSE CONCAT(HOUR(r.start_time), ':', LPAD(MINUTE(r.start_time), 2, '0'), ' AM')
                        END,
                    ' - '
            ),
                                  CASE
                                      WHEN HOUR (r.end_time) > 12 THEN CONCAT(HOUR(r.end_time) - 12, ':', LPAD(MINUTE(r.end_time), 2, '0'), ' PM')
                WHEN HOUR(r.end_time) = 0 THEN CONCAT(12, ':', LPAD(MINUTE(r.end_time), 2, '0'), ' AM')
                ELSE CONCAT(HOUR(r.end_time), ':', LPAD(MINUTE(r.end_time), 2, '0'), ' AM')
                END
    ) AS time,
                          r.description
                   FROM restaurants_users AS r
                            JOIN restaurant_tables AS t
                                 ON r.restaurant_id = t.restaurant_id
                   GROUP BY r.restaurant_id,
                            r.restaurant_name,
                            r.address,
                            r.start_time,
                            r.end_time,
                            r.description
                   ORDER BY r.restaurant_id;
    `;

    const [restaurants] = await db.query(query);

    if (!restaurants) {
        return res.status(404).json({message: "No restaurants found"});
    }

    res.status(200).json(restaurants);
});

UserRouter.get("/restaurant/:id", async (req, res, next) => {
   const query = `select t.table_id, t.booking_status as status, t.description, t.image
                  from restaurant_tables as t
                  where restaurant_id = ?`;

   const id = req.query.id;

    const [table] = await db.query(query, [id]);

    if (!table) {
        return res.status(404).json({message: "No tables found"});
    }

    res.status(200).json(table);
});

UserRouter.get("/restaurant/table/book/:id", async (req, res, next) => {

    const id = req.query.id;

    const query = `insert into bookings (table_id, user_id, status, booking_date, start_time, end_time ) values (?, ?, ?, ?, ?)`;

    const result = await db.query(query, [id]);

    if (result[0].affectedRows === 0) {
        return res.status(404).json({message: "Something went wrong"});
    }

    res.status(201).json({id: result[0].insertId});

});



export default UserRouter;
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
//
// const db = mysql.createConnection({
//     // host: process.env.MYSQL_HOST,
//     // port: process.env.MYSQL_PORT,
//     // user: process.env.MYSQL_USER,
//     // password: process.env.MYSQL_PASSWORD,
//     // database: process.env.MYSQL_DATABASE
//
//
// })

const db = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "resturant"
});

const connectDB = async () => {
    try {
        await db.connect();
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
    }
};

export { db, connectDB };
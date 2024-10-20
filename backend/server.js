import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import coordinatesRoute from "./route/coordinates.route.js"
import bodyParser from "body-parser";


dotenv.config();

const app=express();
const PORT=process.env.PORT||5000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}));

app.use('/api',coordinatesRoute);

app.listen(PORT,()=>{
    console.log("Server started at this port",+ PORT);
    connectDB();
});
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import Product from "../models/Product";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const usersRouter = express.Router();
const client = new MongoClient(process.env.MONGODB_URI!);

const errorResponse = (error: any, res: any) => {
        console.error("FAIL", error);
        res.status(500).json({message: "Internal Server Error"});
}









export default usersRouter;
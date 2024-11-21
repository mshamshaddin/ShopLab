import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import Product from "../models/Product";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const productsRouter = express.Router();
const client = new MongoClient(process.env.MONGODB_URI!);

const errorResponse = (error: any, res: any) => {
        console.error("FAIL", error);
        res.status(500).json({message: "Internal Server Error"});
}

//localhost:3000/api/Products
productsRouter.get("/Products", async (req, res) => {
        try {
            await client.connect();
            const collection = client.db().collection<Product>('products');
            const products = await collection.find({}).toArray();
            res.status(200).json(products);
        } catch (error) {
            errorResponse(error, res);                
        } finally {
            await client.close();
        }
});
    

productsRouter.get("/Products/find/:id", async (req, res) => {
        try{
                await client.connect();
                const collection = client.db().collection<Product>("products");

                const product = await collection.findOne({_id: new ObjectId(req.params.id) });
                if (!product) {
                        res.status(404).send("Product not found");
                      } else {
                        res.status(200).json(product);
                      }
                    } catch (error) {
                      errorResponse(error, res);
                    } finally {
                      await client.close();
                    }          

});


productsRouter.post('/Products', async (req, res) => {
        try {
            await client.connect();
            const collection = client.db().collection<Product>('products');
            const newProduct: Product = req.body;
            const result = await collection.insertOne(newProduct);
            res.status(201).json({ _id: result.insertedId, ...newProduct });
        } catch (error) {
            errorResponse(error, res);
        } finally {
            await client.close();
        }
});

export default productsRouter;
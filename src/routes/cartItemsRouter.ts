import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import Product from "../models/Product";
import User from "../models/User";
import CartItem from "../models/CartItem";
import dotenv from "dotenv";
import usersRouter from "./usersRouter";

dotenv.config();

const cartItemsRouter = express.Router();
const client = new MongoClient(process.env.MONGODB_URI!);

const errorResponse = (error: any, res: any) => {
    console.error("FAIL", error);
    res.status(500).json({message: "Internal Server Error"});
}

cartItemsRouter.get("/users/:userId/cart", async (req, res) => {
    try{
            await client.connect();
            const collection = client.db().collection<User>('users');
            const user = await collection.findOne({_id: new ObjectId(req.params.userId)});

            if (!user){
                res.status(404).send("user not found");

            }else{
                res.status(200).json(user);
            }
        } catch (error) {
            errorResponse(error, res);
          } finally {
            await client.close();
          }   
});

cartItemsRouter.post('/users/:userId/cart', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<CartItem>('cartItems');
        const { userId } = req.params;
        const { product, quantity } = req.body;

        const existingCartItem = await collection.findOne({
            userId: new ObjectId(userId),
            'product._id': product._id,
        });

        if (existingCartItem) {
            const updatedCartItem = await collection.updateOne(
                { _id: existingCartItem._id },
                { $inc: { quantity: quantity } } 
            );
            res.status(200).json({ message: 'Cart item updated', updatedCartItem });
        } else {
               const newCartItem: CartItem = {
                userId: new ObjectId(userId), product, quantity,
            };
            const result = await collection.insertOne(newCartItem);
            res.status(201).json({ message: 'Cart item added', _id: result.insertedId, ...newCartItem });
        }
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

cartItemsRouter.patch('/users/:userId/cart/:productId', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<CartItem>('cartItems');
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        if (typeof quantity !== 'number' || quantity <= 0) {
            res.status(400).json({ error: 'Quantity must be a positive number.' });
        }

        const result = await collection.findOneAndUpdate(
            {
                userId: new ObjectId(userId),
                'product._id': new ObjectId(productId),
            },
            {
                $set: { quantity: quantity },
            },
            {
                returnDocument: 'after',
            }
        );

        if (!result || !result) {
            res.status(404).send('Not found');
        }

        res.status(200).json(result);
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

cartItemsRouter.delete('/users/:userId/cart/:productId', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db().collection<CartItem>('cartItems');
        const { userId, productId } = req.params;

        const result = await collection.deleteOne({
            userId: new ObjectId(userId),
            'product._id': new ObjectId(productId),
        });

        if (result.deletedCount === 0) {
            res.status(404).send('Not found');
        }

        res.status(204).send();
    } catch (error) {
        errorResponse(error, res);
    } finally {
        await client.close();
    }
});

export default cartItemsRouter;
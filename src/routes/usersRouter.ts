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

usersRouter.get("/Users/find/:id", async (req, res) => {
        try{
                await client.connect();
                const collection = client.db().collection<User>("users");

                const user = await collection.findOne({_id: new ObjectId(req.params.id) });
                if (!user) {
                          res.status(404).send("User not found");
                      } else {
                         res.status(200).json(user);
                      }
                
                    } catch (error) {
                      errorResponse(error, res);
                    } finally {
                      await client.close();
                    }          

});


usersRouter.post('/Users', async (req, res) => {
        try {
            await client.connect();
            const collection = client.db().collection<User>('users');
            const newUser: User = req.body;
            const result = await collection.insertOne(newUser);
            res.status(201).json({ _id: result.insertedId, ...newUser });
        } catch (error) {
            errorResponse(error, res);
        } finally {
            await client.close();
        }
});

usersRouter.put('/:id', async (req, res) => {
        const { id } = req.params;
        const updatedUser = req.body;
      
        try {
          await client.connect();
          const collection = client.db().collection('users');
      
          const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updatedUser },
            { returnDocument: 'after' }
          );
      
          if (!result || !result.value) {
            res.status(404).send('User not found');
            return;
          }
      
          res.status(200).json(result.value);
      
        } catch (error) {
          errorResponse(error, res);
        } finally {
          await client.close();
        }
      });

      usersRouter.delete('/:id', async (req, res) => {
        const { id } = req.params;
      
        try {
          await client.connect();
          const collection = client.db().collection('users');
      
          const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
          if (result.deletedCount === 0) {
            res.status(404).send('User not found');
            return;
          }
      
          res.status(204).send(); 
      
        } catch (error) {
          errorResponse(error, res);
        } finally {
          await client.close();
        }
      });





export default usersRouter;
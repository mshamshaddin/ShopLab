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

//localhost:3000/api/Products/?maxPrice=10
productsRouter.get("/Products", async (req, res) => {
        try {
            await client.connect();
            const collection = client.db().collection<Product>('products');

            const { maxPrice, includes, limit } = req.query;

            const query: any = {};
            if (req.query.maxPrice) {
              query.price = { $lte: parseFloat(maxPrice as string) };
            }

            if (req.query.includes) {
              query.name = { $regex: includes as string, $options: 'i' };
            }
          
            let cursor = collection.find(query);
          
            if (req.query.limit) {
              const parsedLimit = parseInt(limit as string, 10);
              cursor = cursor.limit(parsedLimit);
            }
                      
            const products = await cursor.toArray();
            res.status(200).json(products);

            
        } catch (error) {
            errorResponse(error, res);                
        } finally {
            await client.close();
        }
});
    
//http://localhost:3000/api/Products/find/673e95abe17b2ffa33473d0f
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

//http://localhost:3000/api/Products
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


productsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  try {
    await client.connect();
    const collection = client.db().collection('products');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedProduct },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      res.status(404).send('Product not found');
      return;
    }

    res.status(200).json(result.value);

  } catch (error) {
    errorResponse(error, res);
  } finally {
    await client.close();
  }
});


productsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const collection = client.db().collection('products');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).send('Product not found');
      return;
    }

    res.status(204).send(); 

  } catch (error) {
    errorResponse(error, res);
  } finally {
    await client.close();
  }
});


export default productsRouter;
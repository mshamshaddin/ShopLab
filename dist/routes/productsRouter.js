"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const productsRouter = express_1.default.Router();
const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
const errorResponse = (error, res) => {
    console.error("FAIL", error);
    res.status(500).json({ message: "Internal Server Error" });
};
//localhost:3000/api/Products/?maxPrice=10
productsRouter.get("/Products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const { maxPrice, includes, limit } = req.query;
        const query = {};
        if (req.query.maxPrice) {
            query.price = { $lte: parseFloat(maxPrice) };
        }
        if (req.query.includes) {
            query.name = { $regex: includes, $options: 'i' };
        }
        let cursor = collection.find(query);
        if (req.query.limit) {
            const parsedLimit = parseInt(limit, 10);
            cursor = cursor.limit(parsedLimit);
        }
        const products = yield cursor.toArray();
        res.status(200).json(products);
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
//http://localhost:3000/api/Products/find/673e95abe17b2ffa33473d0f
productsRouter.get("/Products/find/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection("products");
        const product = yield collection.findOne({ _id: new mongodb_1.ObjectId(req.params.id) });
        if (!product) {
            res.status(404).send("Product not found");
        }
        else {
            res.status(200).json(product);
        }
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
productsRouter.post('/Products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const collection = client.db().collection('products');
        const newProduct = req.body;
        const result = yield collection.insertOne(newProduct);
        res.status(201).json(Object.assign({ _id: result.insertedId }, newProduct));
    }
    catch (error) {
        errorResponse(error, res);
    }
    finally {
        yield client.close();
    }
}));
exports.default = productsRouter;

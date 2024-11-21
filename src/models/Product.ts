import { ObjectId } from "mongodb";

interface Product {
    _id?: ObjectId;
    name: string;
    price: number;
    photoURL?: string;
}

export default Product;
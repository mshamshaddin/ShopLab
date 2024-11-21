import { ObjectId } from "mongodb";
import Product from "./Product";

interface CartItem {
  _id?: ObjectId;
  userId: ObjectId;
  product: Product;
  quantity: number;
}

export default CartItem;
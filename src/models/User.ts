import { ObjectId } from "mongodb";

interface User {
    _id?: ObjectId;
    displayName: string;
    photoURL?: string;
    darkTheme: boolean;
}

export default User;
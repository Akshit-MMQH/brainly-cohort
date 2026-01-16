import mongoose,{ Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})
export const UserModel = model("Users", UserSchema);

const ContentSchema = new Schema({
    link: String,
    title: String,
    tag: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'Users', required: true}
})
export const ContentModel = model("Contents", ContentSchema);
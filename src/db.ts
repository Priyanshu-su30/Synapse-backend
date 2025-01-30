import mongoose, {model, Schema} from "mongoose";
import config from "dotenv";

mongoose.connect(`mongodb+srv://newton:${process.env.MONGOPASSWORD}@cluster0.5rnez.mongodb.net/brainly`)

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: false }
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: false, unique: true}
})


export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);
import mongoose from "mongoose";
import { createHmac, randomBytes } from 'crypto';
import { createtokenforuser } from '../services/auth.js';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    salt: { type: String },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["dealer", "sales_exec"],
        default: "dealer"
    },
    location: { type: String }
},{timestamps: true});


userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashedpassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedpassword;
    next();
});

userSchema.statics.matchPassword = async function (email, password) {
    const user1 = await this.findOne({ email });

    if (!user1) throw new Error('User not found');

    const userSalt = user1.salt;
    const hashedpassword = user1.password;

    const userprovidedhashedpassword = createHmac('sha256', userSalt).update(password).digest('hex');

    if (hashedpassword !== userprovidedhashedpassword) throw new Error('Incorrect password');

    const token = createtokenforuser(user1);
    return token;
};

const user = mongoose.model('user', userSchema);

export default user;


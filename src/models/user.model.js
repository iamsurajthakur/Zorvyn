import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import env from "../config/env.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ['VIEWER','ANALYST','ADMIN'],
        default: 'VIEWER',
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastLogin: {
        type: Date,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true})

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('passwordHash') || !this.passwordHash) {
            return next();
        }

        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false })
  next()
})

userSchema.methods.isPasswordCorrect = function (password) {
    return bcrypt.compare(password, this.passwordHash)
}

userSchema.methods.generateAccessToken = function (){
    
    if(!env.ACCESS_TOKEN_SECRET) throw new ApiError(400,'ACCESS_TOKEN_SECRET is missing')
    if(!env.ACCESS_TOKEN_EXPIRY) throw new ApiError(400,'ACCESS_TOKEN_EXPIRY is missing')

    const options = {
        expiresIn: env.ACCESS_TOKEN_EXPIRY,
    }

    return jwt.sign(
        {
            _id: this._id
        },
        env.ACCESS_TOKEN_SECRET,
        options
    )
}

userSchema.methods.generateRefreshToken = function () {

    if(!env.REFRESH_TOKEN_SECRET) throw new ApiError(400,'REFRESH_TOKEN_SECRET is missing')
    if(!env.REFRESH_TOKEN_EXPIRY) throw new ApiError(400,'REFRESH_TOKEN_EXPIRY is missing')

    const options = {
        expiresIn: env.REFRESH_TOKEN_EXPIRY,
    }
    
    return jwt.sign(
        {
            _id: this._id
        },
        env.REFRESH_TOKEN_SECRET,
        options
    )
}

export const User = mongoose.model('User', userSchema)
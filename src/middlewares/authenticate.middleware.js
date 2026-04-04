import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import env from '../config/env.js'

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if(!authHeader?.startsWith('Bearer ')){
            throw new ApiError(401,'Token not provided')
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded._id)
        
        if(!user){
            throw new ApiError(401,'User no longer exixts')
        }
        if(!user.isActive){
            throw new ApiError(403,'Account is deactivated')
        }

        req.user = user
        next()

    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
            return next(new ApiError(401,'Invalid token'))
        }
        if(error.name === 'TokenExpiredError'){
            return next(new ApiError(401,'Token expired'))
        }
        next(error)
    }
}
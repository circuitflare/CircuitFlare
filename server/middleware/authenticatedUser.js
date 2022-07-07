const asyncErrorHandler = require('../utils/asyncErrorHandler')
const User = require('../database/models/userSchema')
const jwt = require('jsonwebtoken')
const ErrorHandler = require('../utils/errorHandler')

exports.authenticatedUser = asyncErrorHandler(async(req,res,next) =>{
    const token = req.cookies.logintoken;

    const user = jwt.verify(token , process.env.SECRET)

    if(!user){
        return next(new ErrorHandler("User Is Not Logged In" ,401))
    }

    req.user = await User.findById(user.id);

    next()

})
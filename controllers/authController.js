const User = require("../model/user")
const Organisation = require("../model/organisation")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { validateCreateUser, validateCustomerLogin } = require("../validator/auth");
const { v4: uuidv4 } = require('uuid');

const handleNewUser = async (req,res)=>{
    const userId = uuidv4();
    const orgId = uuidv4();
    try{
        const { error } = validateCreateUser(req.body);
        if (error) return res.status(400).json({status:"Bad request",message:error.details[0].message,statusCode:400});
        const{
            firstname,
            lastname,
            email,
            password,
            phone,
        }=req.body;
        const isEmailRegistered = await User.findOne({ email: email }).exec();
        if (isEmailRegistered) return res.status(409).json({status:"Bad request",message: 'Email already exists',statusCode:409});
        const hashPwd = await bcrypt.hash(password, 10);
        const userorganisation = await Organisation.create({
            name:`${firstname}'s Organisation`,
            orgId:orgId
        })
        if(userorganisation){
            await User.create({
                "firstName":firstname,
                "lastName":lastname,
                "email":email,
                "password":hashPwd,
                "phone":phone,
                "organisation":[userorganisation._id],
                "userId":userId
            })
        }
        res.status(201).json({status:"success",message:"Registration successful",data:{user:{ userId:userId,firstName:firstname,lastName:lastname,email:email,phone:phone}}});
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const handleLogin = async (req,res)=>{
    try{
        const { error } = validateCustomerLogin(req.body);
        if (error) return res.status(400).json({status:"Bad request",message:error.details[0].message,statusCode:400});
        const{
            email,
            password
        }=req.body;
        const isUserRegistered = await User.findOne({ email: email }).exec();
        if (!isUserRegistered) return res.status(401).json({status:"Bad request", message: "User not found",statusCode:401});
        const match = await bcrypt.compare(password, isUserRegistered.password);
        if(match){
            const accessToken = jwt.sign({
                "UserInfo": {
                    "firstName":isUserRegistered.firstName,
                    "lastName":isUserRegistered.lastName,
                    "email":isUserRegistered.email,
                    "phone":isUserRegistered.phone,
                    "userId":isUserRegistered.userId
                }},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'1d'}
            )
            const refreshToken = jwt.sign({
                    "userId":isUserRegistered.userId
                },
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn:'1d'}
            );
            isUserRegistered.refreshToken = refreshToken;
            await isUserRegistered.save();
            res.cookie('jwt', refreshToken, { httpOnly:true, sameSite:"None", secure:true,// Should be true in production
                 maxAge: 24 * 60 * 60 * 1000 });
            res.status(201).json({status:"success",message:"Authentication successful",data:{accessToken:accessToken, user:{ userId:isUserRegistered.userId,firstName:isUserRegistered.firstName,lastName:isUserRegistered.lastName,email:isUserRegistered.email,phone:isUserRegistered.phone}}});
        }else{
            res.status(401).json({status:"Bad request",message:"Password incorrect",statusCode:401});
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
}


const handleRefreshToken = async (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser) return res.status(401).json({message: 'Forbbiden'});
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded)=>{
            if(err || foundUser.username !== decoded.userId) return res.sendStatus(403);
            const accessToken = jwt.sign({
                "UserInfo": {
                    "firstName":isUserRegistered.firstName,
                    "lastName":isUserRegistered.lastName,
                    "email":isUserRegistered.email,
                    "phone":isUserRegistered.phone,
                    "userId":isUserRegistered.userId
                }},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'1d'}
            )
            res.json({accessToken})
        }
    )
}

const handleLogOut = async (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({refreshToken: refreshToken}).exec();
    if(!foundUser){
        res.clearCookie('jwt',{ httpOnly:true,sameSite:"None", secure:true });
        return res.sendStatus(204);
    }
    res.clearCookie('jwt',{httpOnly:true, sameSite:"None", secure:true});
    res.sendStatus(204);
}


module.exports={handleNewUser,handleLogin, handleLogOut, handleRefreshToken}
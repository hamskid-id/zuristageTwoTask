const User = require("../model/user");
const mongoose = require("mongoose");

const getAUser = async (req,res)=>{
    try{
        const {
            id
        }=req.params;
        if (!id) return res.status(400).json({ 'message': "User ID is required" });
        const userToGet = await User.findOne({ userId: id}).exec();
        if(!userToGet) return res.status(400).json({'message':"User not found"});
        res.status(201).json({
            status:"success",
            message:"Record found",
            data:{
                userId:userToGet.userId,
                firstName:userToGet.firstName,
                lastName:userToGet.lastName,
                email:userToGet.email,
                phone:userToGet.phone
            }
        });
    }catch(error){
        res.status(500).json({'message':err.message});
    }
}

const getAllUsers = async (req,res)=>{
    try{
        const usersToGet = await User.find().exec();
        res.status(201).json({
            status:"success",
            message:"Record found",
            data:usersToGet
        });
    }catch(error){
        res.status(500).json({'message':err.message});
    }
}

module.exports={getAUser,getAllUsers}
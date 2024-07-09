const Organisation = require("../model/organisation");
const User = require("../model/user");
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
const { validateAddUserToOrganisation, validateCreateOrganisation } = require("../validator/organisation");

const getAnOrganisation = async (req,res)=>{
    try{
        const{
            orgId
        }=req.params;
        if (!orgId) return res.status(400).json({ 'message': "Organisation ID is required" });
        const orgToGet = await Organisation.findOne({ orgId: orgId }).exec();
        if(!orgToGet) return res.status(400).json({'message':"Organisation not found"});
        res.status(201).json({
            status:"success",
            message:"Record found",
            data:{
                orgId:orgToGet.orgId,
                name:orgToGet.name,
                description:orgToGet.description
            }
        });
    }catch(error){
        res.status(500).json({'message':err.message});
    }
}

const getAllOrganisationsOfUser = async (req,res)=>{
    try{
        const user = await User.findOne({ userId:req.user}).populate('organisation') // Ensure the field name is correct
        if (!user) {
            return res.status(404).json({
                status: "Not found",
                message: "User not found",
                statusCode: 404
            });
        }
        res.status(201).json({
            status:"success",
            message:"Record found",
            data:user.organisation
        });

    }catch(error){
        res.status(500).json({
            status: "Server error",
            message: error.message,
            statusCode: 500
        });
    }
}

const AddUserToOrganisation = async (req,res)=>{
    try{
        const { error } = validateAddUserToOrganisation(req.params);
        if (error) return res.status(400).json({'status':"Bad request",'message':error.details[0].message,statusCode:400});
        const{
            userId,
            orgId
        }=req.params;

        const userExist = await User.findOne({userId:userId}).exec();
        if (!userExist) return res.status(409).json({status:"Bad request",message: 'User not found',statusCode:409});
        const organisationExist = await Organisation.findOne({orgId:orgId}).exec();
        if (!organisationExist) return res.status(409).json({status:"Bad request",message: 'Organisation not found',statusCode:409});
        if (userExist.organisation.includes(organisationExist._id)) {
            return res.status(409).json({
                status: "Conflict",
                message: 'User already part of the organisation',
                statusCode: 409
            });
        }

        userExist.organisation.push(organisationExist.orgId);
        await userExist.save();
        res.status(201).json({'status':"success",'message':"User added successfully"});
    }catch(err){
        res.status(500).json({'message':err.message});
    }
}

const createNewOrganisation = async (req,res)=>{
    const orgId = uuidv4();
    try{
        const { error } = validateCreateOrganisation(req.body);
        if (error) return res.status(400).json({'status':"Bad request",'message':error.details[0].message,statusCode:400});
        const{
            name,
            description
        }=req.body;
        const userExist = await User.findOne({userId:req.user}).exec();
        const userorganisation = await Organisation.create({
            name: name,
            orgId:orgId,
            description:description
        })
        if(userorganisation){
            let newUserOrganisation = [...userExist.organisation,userorganisation._id]
            userExist.organisation = newUserOrganisation;
            await userExist.save();
        }
        res.status(201).json({'status':"success",'message':"Organisation created SuccessFully"});
    }catch(err){
        res.status(500).json({'message':err.message});
    }
}

module.exports={createNewOrganisation,AddUserToOrganisation, getAllOrganisationsOfUser, getAnOrganisation}
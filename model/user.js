const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstName:{
        type:String,
        required:true, 
        lowercase: true
    },
    lastName:{
        type:String,
        required:true,
        lowercase: true
    },
    email:{
        type:String,
        unique: true,
        required:true, 
        lowercase: true
    },
    phone:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true,
        private: true
    },
    organisation:{
        type:[Schema.Types.ObjectId],
        required:true,
        ref:'Organisation'
    },
    refreshToken:String
});
module.exports = mongoose.model("Users", UserSchema);
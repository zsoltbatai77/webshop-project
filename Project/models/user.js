const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');  

const userSchema = new Schema({
    email:{
        type : String,
        required : true,
        index: { unique: true }
    },

    name: {
        type : String,
        required : true
    },

    address: {
        type : String,
        required : false
    },

    password: {
        type : String,
        required : true
    },

    profileImagePath:{
        type: String,
        required: false
    },

    adminPrivileges:{
        type: Boolean,
        required: true
    }
}, { timestamps : true });


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));  
};


userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password); 
};

const User = mongoose.model('User', userSchema);

module.exports = User;

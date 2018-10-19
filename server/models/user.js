const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_I = 10;
require('dotenv').config(); 
const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique: 1
    },
    password:{
        type:String,
        required:true,
        minlength:5
    },
    name:{
        type:String,
        required:true,
        maxlength:100
    },
    lastname:{
        type:String,
        required:true,
        maxlength:100
    },
    cart:{
        type:Array,
        default:[]
    },
    history:{
        type:Array,
        default:[]
    },
    role:{
        type:Number,
        default:0
    },
    token:{
        type:String 
    }

})

userSchema.pre('save',function(next){
    var user = this
    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err)//有錯的話會繼續做post的request
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    }else{
        next();
    }
    
})

userSchema.methods.comparePassword = function(candidatePassword,callback){
     bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return callback(err);
        callback(null,isMatch) //candidatePassword,this.password比對完isMatch會等於 true or false

     })
}

userSchema.methods.generateToken = function(callback){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),process.env.SECRET);
    user.token = token;
    user.save(function(err,user){
        if(err) return callback(err);
        callback(null,user)
         
         
    })
}

userSchema.statics.findByToken = function(token,cb){ //static 靜態函式 當物件被實例化不可被呼叫ex: us = new User
    var user = this;
    
    jwt.verify(token, process.env.SECRET,function(err,decode){
        
        user.findOne({"_id":decode,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })

    })
}


const User = mongoose.model('User',userSchema);//create a model

module.exports = {User}
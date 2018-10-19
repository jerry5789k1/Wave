const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var cors = require('./models/cors');






const app = express();
const mongoose = require('mongoose');
require('dotenv').config();//引入dotenv使可以於撈出env資料

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE)

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Models

const {User} = require('./models/user');
const {Brand} = require('./models/brands');
const {Wood} = require('./models/Wood');
const {Product} = require('./models/product');

//middleware
const {auth} = require('./middleware/auth');
const {admin} = require('./middleware/admin')

  
//=============================
//          PRODUCTS
//=============================
//By Arrival
///articles?sortBy=createdat&order=desc&limit=4


//By SELL
//articles?sortBy=sold&order=desc&limit=4
app.get('/api/product/articles',(req,res)=>{
    let order = req.query.order? req.query.order:'asc';
    let sortBy = req.query.sortBy? req.query.sortBy:'_id';
    let limit = req.query.limit? parseInt(req.query.limit):100;

    Product.find().
    populate('brand').
    populate('wood').
    sort([[sortBy,order]]).//這裡為什麼要[[]]
    limit(limit).
    exec((err,articles)=>{
        if(err) return res.status(400).send(err);
        res.send(articles)

    })

})
app.get('/api/product/articles_by_id',(req,res)=>{
    let type = req.query.type; //由bodyParser.urlencoded({extended:true}解析 
    let items = req.query.id; //由bodyParser.json()解析
    if(type === "array"){
        let ids = req.query.id.split(',');
        items = [];
        items = ids.map(item =>{
            return mongoose.Types.ObjectId(item)
        })

    }
    Product.
    find({'_id':{$in:items}}).//$in查詢在後面陣列裡的範圍的資料
    populate('brand').//populate會到資料庫找id=brand這個欄位裡的id的資料回傳回來
    populate('wood').
    exec((err,docs)=>{
        return res.status(200).send(docs)

    })


})


app.post('/api/product/article',auth,admin,(req,res)=>{
    const product = new Product(req.body);
    product.save((err,doc)=>{
      if(err) return res.json({success:false,err})
      res.status(200).json({success:true,article:doc})
    })
})
 
//=============================
//          WOODS
//=============================
app.post('/api/product/wood',auth,admin,(req,res)=>{
    const wood = new Wood(req.body)
    wood.save((err,doc)=>{
        if(err) return res.json({success:false,err})
        res.status(200).json({success:true,wood:doc})
    })
})

app.get('/api/product/get_woods',(req,res)=>{
    Wood.find({},(err,woods)=>{
        if(err) return res.status(400).send(err)
        res.status(200).send(woods) 
    })
})
//=============================
//          BRANDS
//=============================
app.post('/api/product/brand',auth,admin,(req,res)=>{
    const brand = new Brand(req.body)
    brand.save((err,doc)=>{
        if(err) return res.json({
            success:false,
            err
        })
        res.status(200).json({
            success:true,
            brand:doc
        })
    })

})

app.get('/api/products/get_brands',(req,res)=>{
    Brand.find({},(err,brands)=>{
        if(err) return res.status(400).send(err)
        res.status(200).send(brands)
    })
})
 
//=============================
//           USERS
//=============================
app.get('/api/users/auth',auth,(req,res)=>{  // send a request to /api/users/auth 然後進入 auth middleware沒有錯誤執行 callbackfunction
     res.status(200).json({
         isAdmin: req.user.role === 0? false : true,
         isAuth:true,
         email: req.user.email,
         name:req.user.name,
         lastname:req.user.lastname,
         role:req.user.role,
         cart:req.user.cart,
         history:req.user.history 

     })     
})


app.post('/api/users/register',(req,res)=>{
     const user = new User(req.body) 

     user.save((err,doc)=>{
         if(err) return res.json({success:false,err});
         res.status(200).json({
             success:true
         })

     }) 
})
app.post('/api/users/login',(req,res)=>{
   User.findOne({'email':req.body.email},(err,user )=>{
       if(!user) return res.json({loginSuccess:false,message:'Auth fail e-mail not found'})
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch)return res.json({loginSuccess:false,message:'Wrong Password'})

            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('w_auth', user.token).status(200).json({loginSuccess:true})
            })
        })
  
   })

})

app.get('/api/users/logout',auth,(req,res)=>{
    User.findOneAndUpdate(
        {"_id":req.user._id},
        {token:''},
        (err, doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        }
    )
})

const port = process.env.PORT || 3002;

app.listen(port, ()=>{
    console.log(`Server Running at ${port}`)
})
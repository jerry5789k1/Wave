const { User } = require('./../models/user')

let auth = (req,res,next)=>{
  let token = req.cookies.w_auth;

  User.findByToken(token,(err, user)=> {
     if(err) throw err;
     if(!user) return res.json({
         isAuth:false,
         error:true
     });

     req.token = token;//通過驗證送出request給server with token
     req.user = user; //從findBytoken驗證通過獲得的user資訊
     next();
  })
}

module.exports = { auth }

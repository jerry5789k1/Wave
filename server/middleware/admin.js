let admin = (req,res,next)=>{
    if(req.user.role === 0){
        return res.send("You don't have the authority")
    }
    next()
}

module.exports = { admin }

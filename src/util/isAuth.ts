import express from "express";

export default async (req:express.Request, res:express.Response, next:express.NextFunction)=>{
if(!req.session.isLogedIn){
    // res.json({msg:'must login!'});
    return res.redirect('/login')
 }


 next();
 }
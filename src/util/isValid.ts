import express from "express";

export default async (req:express.Request, res:express.Response, next:express.NextFunction)=>{
if(!req.session.validEmail){
    // res.json({msg:'must login!'});
    return res.redirect('/validateEmail')
 }


 next();
 }
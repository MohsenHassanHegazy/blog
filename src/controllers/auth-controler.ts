import User from "../models/user"
import Post from "../models/post";
import Comment from "../models/comment"
import express from "express";
import bcrypt from "bcryptjs"
import { ValidationError, validationResult } from "express-validator";
import socket from "../socket";
import user from "../models/user";
import {TransactionalEmailsApi,SendSmtpEmail} from "@getbrevo/brevo"




const getSignup = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   res.render('../views/signup', {
      pageTitle: 'signup',
      errors:null,
      oldInput:{email:'',password:''}
   })
}

const postSignup = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   const errors =validationResult(req);
   if(!errors.isEmpty()){
      return res.render('../views/signup',{
         pageTitle:'signup',
         errors:errors.array()
       })
    }
   const email = req.body.email;
   const password = req.body.password;
   const hPassword = await bcrypt.hash(password, 12);
   const name = req.body.name;
   const oldUser = await User.findOne({ email: email })
   if (oldUser) {
      console.log(oldUser);
      return res.render('../views/signup',{
         pageTitle:'signup',
         errors:[{msg:'Email is in use!'}],
         oldInput:{email:email,password:password}
       })
   }

   //verify email 


   const newUser = new User({
      email: email,
      password: hPassword,
      name: name
   });
   const user = await newUser.save();
   res.status(201).redirect('/login')

}

const getverifyEmail =async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.redirect('/login')
   }
      const email =req.session.user.email;
      const name =req.session.user.name;
      if(req.session.user.tokenDate > new Date(Date.now()) ){
         return res.status(200).render('../views/emailVerify',{
            pageTitle: 'email verify',
            errors:[{msg:'the code was sent please try again later' }]
         });
       }
     //verify email 

const SibApiV3Sdk = require('@getbrevo/brevo');

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = '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';

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

let code =   Math.floor(10000+Math.random()*90000)

sendSmtpEmail.subject = "verification code";
sendSmtpEmail.htmlContent = "your code is : "+code;
sendSmtpEmail.sender = {"name":"Mohsen","email":"example@example.com"};
sendSmtpEmail.to = [{"email":email,"name":name}];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data:any) {
   console.log('API called successfully. Returned data: ' + JSON.stringify(data));
 
 }, function(error:any) {
   console.error(error);
 });

 const user =await User.findById(req.session.logedUserId)


 if(!user){
   return res.status(404);
  }
 user.token=code;
 user.tokenDate =new Date(Date.now()+120000)

await user.save()
   return res.status(200).render('../views/emailVerify',{
      pageTitle: 'email verify',
      errors:null
   });
 }

const postverifyEmail =async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.redirect('/login')
   }
   const user =await User.findById(req.session.logedUserId);
   if(!user){return res.status(500)}
   const code =req.body.code;
   let now = new Date(Date.now())
   if(user.tokenDate < now) {
      return res.status(200).render('../views/emailVerify',{
         pageTitle: 'email verify',
         errors:[{msg:'the code has expired resend the email'}]
      });
    }
   console.log(code , user.token)
   if(code != user.token){
      return res.status(200).render('../views/emailVerify',{
         pageTitle: 'email verify',
         errors:[{msg:'wrong code try again'}]
      });
    }
    
    user.validEmail = true;
    await user.save();
    return res.status(200).redirect('/')
}

const getEditUser = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.redirect('/login')
   }
   const userId = req.session.logedUserId;
   const user =await User.findById(userId);
   if(!user){return res.status(500).json('user not found!!')} 

   return res.status(200).render('../views/admin/editUser',{
      pageTitle: 'editUser',
      errors:null,
      oldInput:{name:user.name,email:user.email}
   });;
 }

const PostEditUser = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.redirect('/login')
   }
   const userId = req.session.logedUserId;
   const user =await User.findById(userId);
      if(!user){return res.status(500).json('user not found!!')} 
   const errors =validationResult(req);
   if(!errors.isEmpty()){
      return res.render('../views/admin/editUser', {
         pageTitle: 'editUser',
         errors:errors.array(),
         oldInput:{name:user.name,email:user.email}
    })
    }
   const oldPassword =req.body.oldPassword;
   const match = await bcrypt.compare(oldPassword,user.password);

   if(!match){
      return res.render('../views/admin/editUser', {
         pageTitle: 'editUser',
         errors:[{msg:'wrong password!!'}],
         oldInput:{name:user.name,email:user.email}
    })
}
   user.name =req.body.name;
   user.email =req.body.email;
   user.password =req.body.newPassword;
   if(req.file){ 
      user.avatar =req.file.path.replace("\\" ,"/");
   }
   await user.save();

   return res.status(201).redirect('/');

 }

const getLogin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   console.log(req.csrfToken());
   res.render('../views/login', {
      pageTitle: 'login',
      errors:null ,
      oldInput:{email:'',password:''}
   })
}

const postlogin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   const email = req.body.email;
   const password = req.body.password;
   const errors =validationResult(req);
   console.log(errors.array());
   if(!errors.isEmpty()){
      return res.render('../views/login', {
         pageTitle: 'login',
         errors:errors.array()
      });
    }
   const user = await User.findOne({ email: email });
   if (!user) {
      // socket.getio().emit('err',{msg:'error massege'});
      // console.log('error sent');
      // return res.status(204).send();
         return res.render('../views/login', {
            pageTitle: 'login',
            errors:[{msg:'user not found'}],
            oldInput:{email:email,password:password}
         });
   }
   const userPassword = user.password;
   const match = await bcrypt.compare(password, userPassword)
   if (!match) {
      return res.render('../views/login', {
         pageTitle: 'login',
         errors:[{msg:'wrong password!!!!'}],
         oldInput:{email:email,password:password}

      });
   }

if(user.banDate>new Date(Date.now())){
   return res.render('../views/login', {
      pageTitle: 'login',
      errors:[{msg:'this email is banned and will be un banned at  '+user.banDate.toString()}],
      oldInput:{email:email,password:password}
   });

 }  

   req.session.user = user;
   req.session.logedUserId = user._id.toString();
   req.session.isLogedIn = true;
   req.session.isAdmin = user.isadmin;
   req.session.validEmail=user.validEmail;


   return res.status(200).redirect('/');
}

const postLogout = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
 }
 
 const getProfile = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
      const userId =req.params.userId;
      const user = await User.findById(userId);
      if(!user){
         return res.status(404).json('user not found');
       }
       return res.render('../views/dashboard/userProfile',{
         pageTitle:'profile',
         errors:null,
         user:{
            _id:user._id.toString(),
            name:user.name,
            avatar:user.avatar
          }
        })

}


const ex = {
   postSignup: postSignup,
   getLogin: getLogin,
   postlogin: postlogin,
   postLogout:postLogout,
   getSignup: getSignup,
   getEditUser:getEditUser,
   postEditUser:PostEditUser,
   getverifyEmail:getverifyEmail,
   postverifyEmail:postverifyEmail,
   getProfile:getProfile
}

export default ex;
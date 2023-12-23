import { Router } from "express";
import adminControler from "../controllers/auth-controler";
import { body } from "express-validator";
import isAuth from "../util/isAuth";
import validEmail from "../util/isValid";

const router =Router();


router.get('/signup',adminControler.getSignup)

router.post('/signup',[
    body('email','enter a valid email')
        .trim()
        .isEmail()
    ,body('name','name is required!')
        .notEmpty()
    ,body('password','password must be at least 5 characters long.')
        .trim()
        .isLength({min:5})

 ],adminControler.postSignup);

router.get('/login',adminControler.getLogin);

router.get('/validateEmail',isAuth,adminControler.getverifyEmail)

router.post('/validateEmail',isAuth,adminControler.postverifyEmail)

router.post('/loginpost', [
    body('email','enter a valid email').isLength({min:1}),
    body('password').isLength({min:1})
],
adminControler.postlogin);

router.post('/logout',isAuth,adminControler.postLogout);

router.get('/editUser',isAuth,adminControler.getEditUser);

router.post('/editUser',isAuth,[
    body('email','enter a valid email')
        .trim()
        .isEmail()
    ,body('name','name is required!')
        .notEmpty()
    ,body('password','password must be at least 5 characters long.')
        .trim()
        .isLength({min:5})

 ],adminControler.postEditUser);

 router.get('/profile/:userId',adminControler.getProfile);



export default router;

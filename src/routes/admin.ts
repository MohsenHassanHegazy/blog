import { Router } from "express";
import adminController from "../controllers/admin-controller";
import { body } from "express-validator";
import isAuth from "../util/isAuth";

const router =Router();

router.get('/dashBoard',isAuth,adminController.getdashBoard)

router.get('/banUser/:userId',isAuth,adminController.getbanUser)

router.post('/banUser/',isAuth,adminController.banUser)

router.post ('/unBanUser/',isAuth,adminController.unBanUser)

export default router;

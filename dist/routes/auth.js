"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controler_1 = __importDefault(require("../controllers/auth-controler"));
const express_validator_1 = require("express-validator");
const isAuth_1 = __importDefault(require("../util/isAuth"));
const router = (0, express_1.Router)();
router.get('/signup', auth_controler_1.default.getSignup);
router.post('/signup', [
    (0, express_validator_1.body)('email', 'enter a valid email')
        .trim()
        .isEmail(),
    (0, express_validator_1.body)('name', 'name is required!')
        .notEmpty(),
    (0, express_validator_1.body)('password', 'password must be at least 5 characters long.')
        .trim()
        .isLength({ min: 5 })
], auth_controler_1.default.postSignup);
router.get('/login', auth_controler_1.default.getLogin);
router.get('/validateEmail', isAuth_1.default, auth_controler_1.default.getverifyEmail);
router.post('/validateEmail', isAuth_1.default, auth_controler_1.default.postverifyEmail);
router.post('/loginpost', [
    (0, express_validator_1.body)('email', 'enter a valid email').isLength({ min: 1 }),
    (0, express_validator_1.body)('password').isLength({ min: 1 })
], auth_controler_1.default.postlogin);
router.post('/logout', isAuth_1.default, auth_controler_1.default.postLogout);
router.get('/editUser', isAuth_1.default, auth_controler_1.default.getEditUser);
router.post('/editUser', isAuth_1.default, [
    (0, express_validator_1.body)('email', 'enter a valid email')
        .trim()
        .isEmail(),
    (0, express_validator_1.body)('name', 'name is required!')
        .notEmpty(),
    (0, express_validator_1.body)('password', 'password must be at least 5 characters long.')
        .trim()
        .isLength({ min: 5 })
], auth_controler_1.default.postEditUser);
router.get('/profile/:userId', auth_controler_1.default.getProfile);
exports.default = router;

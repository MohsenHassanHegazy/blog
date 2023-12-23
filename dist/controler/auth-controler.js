"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const socket_1 = __importDefault(require("../socket"));
const getSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('../views/signup', {
        pageTitle: 'signup',
        errors: null
    });
});
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('../views/signup', {
            pageTitle: 'signup',
            errors: errors.array()
        });
    }
    const email = req.body.email;
    const oldUser = yield user_1.default.findOne({ email: email });
    if (oldUser) {
        console.log(oldUser);
        return res.render('../views/signup', {
            pageTitle: 'signup',
            errors: [{ msg: 'Email is in use!' }]
        });
    }
    const password = req.body.password;
    const hPassword = yield bcryptjs_1.default.hash(password, 12);
    const name = req.body.name;
    const newUser = new user_1.default({
        email: email,
        password: hPassword,
        name: name
    });
    const user = yield newUser.save();
    res.status(201).redirect('/login');
});
const getEditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    return res.status(200).render('../views/admin/editUser', {
        pageTitle: 'editUser',
        errors: null
    });
    ;
});
const PostEditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const userId = req.session.logedUserId;
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        socket_1.default.getio().emit('errors', { arr: errors.array() });
        return res.status(203).send();
    }
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(500).json('user not found!!');
    }
    const oldPassword = req.body.oldPassword;
    const match = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!match) {
        return res.render('../views/admin/editUser', {
            pageTitle: 'editUser',
            errors: [{ msg: 'worong password!!' }]
        });
    }
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.newPassword;
    if (req.file) {
        user.avatar = req.file.path.replace("\\", "/");
    }
    yield user.save();
    return res.status(201).redirect('/');
});
const getLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.csrfToken());
    res.render('../views/login', {
        pageTitle: 'login',
        errors: null,
        oldInput: { email: '', password: '' }
    });
});
const postlogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const errors = express_validator_1.validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.render('../views/login', {
            pageTitle: 'login',
            errors: errors.array()
        });
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        socket_1.default.getio().emit('err', { msg: 'error massege' });
        console.log('error sent');
        return res.status(204).send();
        // return res.render('../views/login', {
        //    pageTitle: 'login',
        //    errors:[{msg:'user not found'}],
        //    oldInput:{email:email,password:password}
        // });
    }
    const userPassword = user.password;
    const match = yield bcryptjs_1.default.compare(password, userPassword);
    if (!match) {
        return res.render('../views/login', {
            pageTitle: 'login',
            errors: [{ msg: 'wrong password!!!!' }],
            oldInput: { email: email, password: password }
        });
    }
    if (user.banDate > new Date(Date.now())) {
        return res.render('../views/login', {
            pageTitle: 'login',
            errors: [{ msg: 'this email is banned and will be unband at  ' + user.banDate.toString() }],
            oldInput: { email: email, password: password }
        });
    }
    req.session.user = user;
    req.session.logedUserId = user._id.toString();
    req.session.isLogedIn = true;
    req.session.isAdmin = user.isadmin;
    return res.status(200).redirect('/');
});
const postLogout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
});
const ex = {
    postSignup: postSignup,
    getLogin: getLogin,
    postlogin: postlogin,
    postLogout: postLogout,
    getSignup: getSignup,
    getEditUser: getEditUser,
    postEditUser: PostEditUser
};
exports.default = ex;

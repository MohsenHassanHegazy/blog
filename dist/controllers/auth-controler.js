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
const getSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("../views/signup", {
        pageTitle: "signuppp",
        errors: null,
        oldInput: { email: "", password: "" },
    });
});
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.render("../views/signup", {
            pageTitle: "signup",
            errors: errors.array(),
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    const hPassword = yield bcryptjs_1.default.hash(password, 12);
    const name = req.body.name;
    const oldUser = yield user_1.default.findOne({ email: email });
    if (oldUser) {
        console.log(oldUser);
        return res.render("../views/signup", {
            pageTitle: "signup",
            errors: [{ msg: "Email is in use!" }],
            oldInput: { email: email, password: password },
        });
    }
    //verify email
    const newUser = new user_1.default({
        email: email,
        password: hPassword,
        name: name,
    });
    const user = yield newUser.save();
    res.status(201).redirect("/login");
});
const getverifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const email = req.session.user.email;
    const name = req.session.user.name;
    if (req.session.user.tokenDate > new Date(Date.now())) {
        return res.status(200).render("../views/emailVerify", {
            pageTitle: "email verify",
            errors: [{ msg: "the code was sent please try again later" }],
        });
    }
    //verify email
    const SibApiV3Sdk = require("@getbrevo/brevo");
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications["apiKey"];
    let abikey = process.env.mailkey;
    if (!abikey) {
        abikey = "no key.";
    }
    apiKey.apiKey = abikey;
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    let code = Math.floor(10000 + Math.random() * 90000);
    sendSmtpEmail.subject = "verification code";
    sendSmtpEmail.htmlContent = "your code is : " + code;
    sendSmtpEmail.sender = { name: "gaming blog", email: "example@example.com" };
    sendSmtpEmail.to = [{ email: email, name: name }];
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
        console.log("API called successfully. Returned data: " + JSON.stringify(data));
    }, function (error) {
        console.error(error);
    });
    const user = yield user_1.default.findById(req.session.logedUserId);
    if (!user) {
        return res.status(404);
    }
    user.token = code;
    user.tokenDate = new Date(Date.now() + 120000);
    yield user.save();
    return res.status(200).render("../views/emailVerify", {
        pageTitle: "email verify",
        errors: null,
    });
});
const postverifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const user = yield user_1.default.findById(req.session.logedUserId);
    if (!user) {
        return res.status(500);
    }
    const code = req.body.code;
    let now = new Date(Date.now());
    if (user.tokenDate < now) {
        return res.status(200).render("../views/emailVerify", {
            pageTitle: "email verify",
            errors: [{ msg: "the code has expired resend the email" }],
        });
    }
    console.log(code, user.token);
    if (code != user.token) {
        return res.status(200).render("../views/emailVerify", {
            pageTitle: "email verify",
            errors: [{ msg: "wrong code try again" }],
        });
    }
    user.validEmail = true;
    yield user.save();
    return res.status(200).redirect("/");
});
const getEditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const userId = req.session.logedUserId;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(500).json("user not found!!");
    }
    return res.status(200).render("../views/admin/editUser", {
        pageTitle: "editUser",
        errors: null,
        oldInput: { name: user.name, email: user.email },
    });
});
const PostEditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const userId = req.session.logedUserId;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(500).json("user not found!!");
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.render("../views/admin/editUser", {
            pageTitle: "editUser",
            errors: errors.array(),
            oldInput: { name: user.name, email: user.email },
        });
    }
    const oldPassword = req.body.oldPassword;
    const match = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!match) {
        return res.render("../views/admin/editUser", {
            pageTitle: "editUser",
            errors: [{ msg: "wrong password!!" }],
            oldInput: { name: user.name, email: user.email },
        });
    }
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.newPassword;
    if (req.file) {
        user.avatar = req.file.path.replace("\\", "/");
    }
    yield user.save();
    return res.status(201).redirect("/");
});
const getLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.csrfToken());
    res.render("../views/login", {
        pageTitle: "login",
        errors: null,
        oldInput: { email: "", password: "" },
    });
});
const postlogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const errors = (0, express_validator_1.validationResult)(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.render("../views/login", {
            pageTitle: "login",
            errors: errors.array(),
        });
    }
    const user = yield user_1.default.findOne({ email: email });
    if (!user) {
        // socket.getio().emit('err',{msg:'error massege'});
        // console.log('error sent');
        // return res.status(204).send();
        return res.render("../views/login", {
            pageTitle: "login",
            errors: [{ msg: "user not found" }],
            oldInput: { email: email, password: password },
        });
    }
    const userPassword = user.password;
    const match = yield bcryptjs_1.default.compare(password, userPassword);
    if (!match) {
        return res.render("../views/login", {
            pageTitle: "login",
            errors: [{ msg: "wrong password!!!!" }],
            oldInput: { email: email, password: password },
        });
    }
    if (user.banDate > new Date(Date.now())) {
        return res.render("../views/login", {
            pageTitle: "login",
            errors: [
                {
                    msg: "this email is banned and will be un banned at  " +
                        user.banDate.toString(),
                },
            ],
            oldInput: { email: email, password: password },
        });
    }
    req.session.user = user;
    req.session.logedUserId = user._id.toString();
    req.session.isLogedIn = true;
    req.session.isAdmin = user.isadmin;
    req.session.validEmail = user.validEmail;
    return res.status(200).redirect("/");
});
const postLogout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
});
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(404).json("user not found");
    }
    return res.render("../views/dashboard/userProfile", {
        pageTitle: "profile",
        errors: null,
        user: {
            _id: user._id.toString(),
            name: user.name,
            avatar: user.avatar,
        },
    });
});
const ex = {
    postSignup: postSignup,
    getLogin: getLogin,
    postlogin: postlogin,
    postLogout: postLogout,
    getSignup: getSignup,
    getEditUser: getEditUser,
    postEditUser: PostEditUser,
    getverifyEmail: getverifyEmail,
    postverifyEmail: postverifyEmail,
    getProfile: getProfile,
};
exports.default = ex;

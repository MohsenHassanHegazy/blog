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
const getdashBoard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    if (!req.session.user.isadmin) {
        return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    return res.render("../views/dashbord/dashBoard", {
        errors: null,
    });
});
const getbanUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    if (!req.session.user.isadmin) {
        return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    const userId = req.params.userId;
    return res
        .status(200)
        .render("../views/dashbord/banUser", { userId: userId, errors: null });
});
const banUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    if (!req.session.user.isadmin) {
        return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    const userId = req.params.userId;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(404).json("user not found");
    }
    if (user.isadmin) {
        return res.send("cant ban admins");
    }
    const dat = req.body.dat;
    user.banDate = new Date(dat);
    user.save();
    return res.status(200).redirect("/");
});
const unBanUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    if (!req.session.user.isadmin) {
        return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    const userId = req.params.userId;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(404).json("user not found");
    }
    user.banDate = new Date(Date.now());
    user.save();
    return res.status(200).redirect("/");
});
const ex = {
    getdashBoard: getdashBoard,
    banUser: banUser,
    unBanUser: unBanUser,
    getbanUser: getbanUser,
};
exports.default = ex;

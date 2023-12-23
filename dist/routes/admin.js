"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("../controllers/admin-controller"));
const isAuth_1 = __importDefault(require("../util/isAuth"));
const router = (0, express_1.Router)();
router.get('/dashBoard', isAuth_1.default, admin_controller_1.default.getdashBoard);
router.get('/banUser/:userId', isAuth_1.default, admin_controller_1.default.getbanUser);
router.post('/banUser/', isAuth_1.default, admin_controller_1.default.banUser);
router.post('/unBanUser/', isAuth_1.default, admin_controller_1.default.unBanUser);
exports.default = router;

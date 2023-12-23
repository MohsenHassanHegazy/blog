"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controler_1 = __importDefault(require("../controllers/post-controler"));
const express_validator_1 = require("express-validator");
const isAuth_1 = __importDefault(require("../util/isAuth"));
const isValid_1 = __importDefault(require("../util/isValid"));
const router = (0, express_1.Router)();
router.get('/', post_controler_1.default.getmain);
router.post('/comment', [
    (0, express_validator_1.body)('content', 'comment can not be empty!!!')
        .isLength({ min: 1 }),
    (0, express_validator_1.body)('postId', 'post not send')
        .notEmpty()
], isAuth_1.default, post_controler_1.default.postNewComment);
router.post('/replay', [
    (0, express_validator_1.body)('content', 'comment can not be empty!!!')
        .isLength({ min: 1 }),
    (0, express_validator_1.body)('commentId', 'commentId not send')
], isAuth_1.default, isValid_1.default, post_controler_1.default.postNewReplay);
router.get('/getReplay/:commentId', post_controler_1.default.getReplay);
router.get('/getComments/:postId', post_controler_1.default.getComments);
router.post('/likeComment', isAuth_1.default, isValid_1.default, post_controler_1.default.likeComment);
router.post('/editComment', (0, express_validator_1.body)('content', 'content is required!')
    .notEmpty(), isAuth_1.default, isValid_1.default, post_controler_1.default.editComment);
router.delete('/deleteComment', isAuth_1.default, isValid_1.default, post_controler_1.default.deleteComment);
router.get('/newPost', isAuth_1.default, isValid_1.default, post_controler_1.default.getNewPost);
router.post('/newPost', [
    (0, express_validator_1.body)('title', 'title is required!')
        .notEmpty(),
    (0, express_validator_1.body)('content', 'content is required!')
        .notEmpty()
], isAuth_1.default, post_controler_1.default.postNewPost);
router.put('/editPost', isAuth_1.default, isValid_1.default, post_controler_1.default.editPost);
router.delete('/deletePost', isAuth_1.default, isValid_1.default, post_controler_1.default.deletePost);
router.get('/post/:postId', post_controler_1.default.getPost);
router.get('/posts', post_controler_1.default.getPosts);
exports.default = router;

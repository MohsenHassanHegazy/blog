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
const post_1 = __importDefault(require("../models/post"));
const comment_1 = __importDefault(require("../models/comment"));
const express_validator_1 = require("express-validator");
const socket_1 = __importDefault(require("../socket"));
const getmain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect('/posts');
});
const getNewPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('../views/admin/newPost', {
        pageTitle: 'newPost',
        errors: null
    });
});
const postNewPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const userId = req.session.user._id;
    if (!req.file) {
        return res.render('../views/admin/newPost', {
            pageTitle: 'newPost',
            errors: [{ msg: 'image is required!' }]
        });
    }
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('../views/admin/newPost', {
            pageTitle: 'newPost',
            errors: errors.array()
        });
    }
    const posterUrl = req.file.path.replace("\\", "/");
    ;
    const newPost = new post_1.default({
        title: req.body.title,
        content: req.body.content,
        posterUrl: posterUrl,
        creator: userId
    });
    console.log('userId = ', userId);
    const post = yield newPost.save();
    const user = yield user_1.default.findById(userId);
    if (!user) {
        throw new Error('ladkj');
    }
    user.posts.push(post._id);
    yield user.save();
    res.status(201).redirect('/posts');
});
const getEditPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const postId = req.body.postId;
    const post = yield post_1.default.findById(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.session.user._id.toString()) {
        return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
    }
    return res.status(200).render('../views/admin/editPost', {
        pageTitle: 'newPost',
        errors: null,
        oldInput: {
            title: post.title,
            content: post.content,
            posterUrl: post.posterUrl
        }
    });
});
const editPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const postId = req.body.postId;
    const post = yield post_1.default.findById(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.session.user._id.toString()) {
        return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
    }
    post.title = req.body.title;
    post.content = req.body.content;
    yield post.save();
    return res.status(201).redirect('/post/' + postId);
});
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const postId = req.body.postId;
    const post = yield post_1.default.findById(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.session.user._id.toString() && !req.session.user.isadmin) {
        return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
    }
    yield post_1.default.findByIdAndDelete(postId);
    const user = yield user_1.default.findById(req.session.user._id).populate('posts');
    if (user) {
        const newposts = user.posts.filter((p) => p._id.toString() !== postId);
        user.posts = newposts;
        yield user.save();
    }
    yield comment_1.default.deleteMany({ postId: postId });
    return res.status(200).redirect('/posts');
});
const postNewComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const errors = express_validator_1.validationResult(req);
    const userId = req.session.user._id;
    console.log(errors);
    if (!errors.isEmpty()) {
        return res.redirect('/post/' + req.body.postId);
    }
    const newComment = new comment_1.default({
        postId: req.body.postId,
        content: req.body.content,
        userId: userId
    });
    if (req.body.commentId) {
        newComment.parent = req.body.commentId;
    }
    const comment = yield newComment.save();
    if (req.body.commentId) {
        const replay = yield comment_1.default.findById(req.body.commentId);
        if (replay) {
            replay.replay.push(comment._id);
            yield replay.save();
        }
    }
    const user = yield user_1.default.findById(userId);
    if (user) {
        user.comments.push(comment._id);
        yield user.save();
        if (!req.body.commentId) {
            const post = yield post_1.default.findById(req.body.postId);
            if (post) {
                post.comments.push(comment._id);
                yield post.save();
            }
        }
        socket_1.default.getio().emit('newComment', { comment: { name: user.name,
                content: comment.content,
                likes: 0,
                dislikes: 0,
                userId: user._id.toString() },
            msg: 'new comment was posted'
        });
    }
    return res.status(204).send();
});
const likeComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const commentId = req.body.commentId;
    const status = req.body.status;
    const comment = yield comment_1.default.findById(commentId);
    if (!comment) {
        return res.status(500).json({ message: 'comment not found' });
    }
    const user = yield user_1.default.findById(req.session.user._id);
    if (!user) {
        return res.status(500).json({ message: 'user not found' });
    }
    console.log(status);
    if (status == 1) {
        const arr = user.likedComments;
        for (let i = 0; i != arr.length; i++) {
            if (arr[i].toString() === commentId) {
                return res.status(200).redirect('/post/' + req.body.postId);
            }
        }
        user.likedComments.push(commentId);
        comment.likes++;
    }
    else if (status == 2) {
        const arr = user.dislikedComments;
        for (let i = 0; i != arr.length; i++) {
            if (arr[i].toString() === commentId) {
                return res.status(200).redirect('/post/' + req.body.postId);
            }
        }
        user.dislikedComments.push(commentId);
        comment.dislikes++;
    }
    yield user.save();
    yield comment.save();
    res.status(200).redirect('/post/' + req.body.postId);
});
const editComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const commentId = req.body.commentId;
    // console.log(req.body);
    const comment = yield comment_1.default.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: 'comment not found.' });
    }
    if (comment.userId.toString() !== req.session.user._id.toString()) {
        return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
    }
    comment.content = req.body.content;
    yield comment.save();
    return res.status(201).redirect('/post/' + req.body.postId);
});
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const commentId = req.body.commentId;
    // console.log(req.body);
    const comment = yield comment_1.default.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: 'comment not found.' });
    }
    if (comment.userId.toString() !== req.session.user._id.toString() && !req.session.user.isadmin) {
        return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
    }
    yield comment_1.default.findByIdAndDelete(commentId);
    const post = yield post_1.default.findById(req.body.postId);
    if (post) {
        post.comments.filter((com) => com !== commentId);
        yield post.save();
    }
    const user = yield user_1.default.findById(req.session.user._id);
    if (user) {
        user.comments.filter((com) => com !== commentId);
        yield user.save();
    }
    return res.status(201).redirect('/post/' + req.body.postId);
});
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_1.default.find();
    const arr = [];
    for (let i = 0; i < posts.length; i++) {
        const p = {
            title: posts[i].title,
            posterUrl: posts[i].posterUrl,
            updatedAt: posts[i].updatedAt,
            _id: posts[i]._id.toString()
        };
        // console.log(p);
        arr.push(p);
    }
    res.status(200).render('../views/main/mainPage', {
        pageTitle: 'main',
        posts: arr,
        errors: null
    });
});
const commentsFunc = (comment) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(comment.userId);
    let name;
    let avatar;
    if (!user) {
        name = 'deleted user';
        avatar = 'https://as2.ftcdn.net/v2/jpg/03/32/59/65/1000_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg';
    }
    else {
        console.log(user._doc);
        name = user.name;
        avatar = user.avatar;
    }
    return { name: name,
        avatar: avatar,
        content: comment.content,
        likes: comment.likes,
        dislikes: comment.dislikes,
        id: comment._id.toString(),
        userId: comment.userId.toString() };
});
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userId;
    const postId = req.params.postId;
    const post = yield post_1.default.findById(postId);
    if (!post) {
        return res.status(404).json({ msg: "post not found" });
    }
    userId = post.creator.toString();
    res.status(200).render('../views/main/post', { postId: postId, userId: userId, pageTitle: post.title, post: Object.assign({}, post._doc), errors: null });
});
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const post = yield post_1.default.findById(postId).populate('comments');
    if (!post) {
        return res.status(404).json({ msg: "post not found" });
    }
    const coments = post.comments;
    const arr = [];
    for (let i = 0; i != coments.length; i++) {
        const comId = coments[i];
        const com = yield comment_1.default.findById(comId);
        if (!com) {
            continue;
        }
        if (com.parent !== null) {
            continue;
        }
        arr.push(yield commentsFunc(com));
    }
    socket_1.default.getio().emit('getComments', { arr: arr });
    console.log('comments sent');
    return res.status(204).send();
});
const getReplay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comId = req.params.commentId;
    const comment = yield comment_1.default.findById(comId);
    const arr = [];
    if (!comment) {
        return res.status(404);
    }
    ;
    for (let i = 0; i < comment.replay.length; i++) {
        const repId = comment.replay[i];
        const replay = yield comment_1.default.findById(repId);
        if (!replay) {
            continue;
        }
        const re = yield commentsFunc(replay);
        console.log(re);
        arr.push(re);
    }
    yield socket_1.default.getio().emit('getReplay', { arr: arr, id: comId });
    // console.log(arr);
    return res.status(204).send();
});
const ex = {
    getNewPost: getNewPost,
    postNewPost: postNewPost,
    postNewComment: postNewComment,
    getPosts: getPosts,
    getPost: getPost,
    getEditPost: getEditPost,
    editPost: editPost,
    deletePost: deletePost,
    getmain: getmain,
    likeComment: likeComment,
    editComment: editComment,
    deleteComment: deleteComment,
    getComments: getComments,
    getReplay: getReplay
};
exports.default = ex;

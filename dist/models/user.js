"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true,
        default: 'https://as2.ftcdn.net/v2/jpg/03/32/59/65/1000_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg'
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: Number,
        required: true,
        default: 0
    },
    tokenDate: {
        type: Date,
        required: true,
        default: new Date('2000-4-4')
    },
    validEmail: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    posts: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Post'
        }],
    comments: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Comment'
        }],
    likedPosts: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Post'
        }],
    likedComments: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Comment'
        }],
    dislikedPosts: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Post'
        }],
    dislikedComments: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Comment'
        }],
    isadmin: {
        type: Boolean,
        default: false
    },
    banDate: {
        type: Date,
        required: true,
        default: new Date('2000-4-4')
    }
});
exports.default = (0, mongoose_1.model)('User', User);

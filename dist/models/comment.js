"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replay: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Comment',
            required: true
        }],
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Comment', CommentSchema);
//

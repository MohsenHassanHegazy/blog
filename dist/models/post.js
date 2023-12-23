"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    imagesListUrl: [],
    comments: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Comment'
        }],
    creator: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Post', PostSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
let io;
exports.default = {
    init: (httpserver) => {
        io = new socket_io_1.Server(httpserver);
        return io;
    },
    getio: () => {
        if (!io) {
            throw new Error('socketIO not initialized!');
        }
        return io;
    }
};

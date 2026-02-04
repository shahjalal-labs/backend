"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryMessage = void 0;
//
const entryMessage = (req, res) => {
    res.send({
        message: "Welcome to Julfinar server!!!",
    });
};
exports.entryMessage = entryMessage;

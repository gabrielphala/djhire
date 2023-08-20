"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeId = void 0;
const makeId = (length) => {
    var string = '';
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    var charLength = chars.length;
    for (var i = 0; i < length; i++) {
        string += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return string;
};
exports.makeId = makeId;
//# sourceMappingURL=String.js.map
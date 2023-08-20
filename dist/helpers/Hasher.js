"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.default = new (class Hasher {
    hash = (str) => {
        return new Promise((resolve, reject) => {
            bcryptjs_1.default.genSalt(10, (err, salt) => {
                if (err) {
                    reject('Something went wrong, try again later');
                    return;
                }
                bcryptjs_1.default.hash(str, salt, (err, hash) => {
                    if (err) {
                        reject('Something went wrong, try again later');
                        return;
                    }
                    resolve(hash);
                });
            });
        });
    };
    isSame = (hash, plain) => {
        return new Promise((resolve, reject) => {
            bcryptjs_1.default.compare(plain, hash, (err, results) => {
                if (err) {
                    reject('Something went wrong, try again later');
                    return;
                }
                resolve(results);
            });
        });
    };
});
//# sourceMappingURL=Hasher.js.map
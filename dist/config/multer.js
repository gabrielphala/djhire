"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyFiles = exports.noFiles = exports.singleFile = exports.setStorage = void 0;
const multer = require('multer');
const path = require('path');
const { checkExt } = require('../helpers/filetypes');
const getExtension = (fname) => {
    return path.extname(fname);
};
const getNameWithoutExt = (ext, fname) => {
    return fname.split(ext)[0];
};
const setStorage = (destination) => {
    return multer.diskStorage({
        destination: destination,
        filename: (req, file, cb) => {
            let ext = getExtension(file.originalname), nameWithoutExt = getNameWithoutExt(ext, file.originalname), timestamp = Date.now();
            cb(null, nameWithoutExt + '-' + timestamp + ext);
        }
    });
};
exports.setStorage = setStorage;
const getLimits = (type = 'images') => {
    return {
        fileSize: type == 'images' ? 18_000_000 : 500_000_000,
        fileFilter: () => ((_req, file, cb) => {
            return checkExt(file, cb, type);
        })
    };
};
const singleFile = (destination, field) => {
    let storage = (0, exports.setStorage)(destination);
    return multer({
        storage,
        limits: getLimits()
    }).single(field);
};
exports.singleFile = singleFile;
const noFiles = (destination) => {
    let storage = (0, exports.setStorage)(destination);
    return multer({
        storage,
        limits: getLimits()
    }).none();
};
exports.noFiles = noFiles;
const anyFiles = (destination, type = 'images') => {
    let storage = (0, exports.setStorage)(destination);
    return multer({
        storage,
        limits: getLimits(type)
    }).any();
};
exports.anyFiles = anyFiles;
//# sourceMappingURL=multer.js.map
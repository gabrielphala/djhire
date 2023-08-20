const multer = require('multer');
const path = require('path');

const { checkExt } = require('../helpers/filetypes');

const getExtension = (fname: string) => {
    return path.extname(fname);
}

const getNameWithoutExt = (ext: string, fname: string) => {
    return fname.split(ext)[0];
}

export const setStorage = (destination: string) => {
    return multer.diskStorage({
        destination: destination,
        filename: (req, file, cb) => {
            let ext = getExtension(file.originalname),
                nameWithoutExt = getNameWithoutExt(ext, file.originalname),
                timestamp = Date.now();

            cb(null, nameWithoutExt + '-' + timestamp + ext)
        }
    });
}

const getLimits = (type = 'images') => {
    return {
        fileSize: type == 'images' ? 18_000_000 : 500_000_000,
        fileFilter: () => ((_req, file, cb) => {
            return checkExt(file, cb, type);
        })
    }
}

export const singleFile = (destination, field) => {
    let storage = setStorage(destination);

    return multer({
        storage,
        limits: getLimits()
    }).single(field);
}

export const noFiles = (destination: string) => {
    let storage = setStorage(destination);

    return multer({
        storage,
        limits: getLimits()
    }).none();
}

export const anyFiles = (destination: string, type: string = 'images') => {
    let storage = setStorage(destination);

    return multer({
        storage,
        limits: getLimits(type)
    }).any();
}
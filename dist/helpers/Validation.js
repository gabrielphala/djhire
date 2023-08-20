"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new (class Validation {
    validate = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] == 'string' && !obj[key])
                throw `${key} cannot be blank/empty!`;
            if (typeof obj[key] == 'object') {
                const fieldValue = obj[key].value;
                if (!obj[key].value)
                    throw `${key} cannot be blank/empty!`;
                if (obj[key].min && fieldValue.length < obj[key].min)
                    throw `${key} must be at least ${obj[key].min} characters long`;
                if (obj[key].max && fieldValue.length > obj[key].max)
                    throw `${key} must be not more than ${obj[key].max} characters long`;
                if (obj[key].is && obj[key].is[0] && fieldValue != obj[obj[key].is[0]].value) {
                    if (obj[key].is[1])
                        throw obj[key].is[1];
                    throw `${key} must be the same as ${obj[key].is[0]}`;
                }
            }
        }
    };
});
//# sourceMappingURL=Validation.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
exports.default = new (class Organizer extends sqlifier_1.SQLifier {
    constructor() {
        super();
        this.schema('organizer', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            fullname: { type: 'varchar', length: 50 },
            email: { type: 'varchar', length: 50 },
            password: { type: 'varchar', length: 250 },
            createdOn: { type: 'datetime', default: sqlifier_1.SQLDate.now },
            isDeleted: { type: 'boolean', default: false }
        });
    }
});
//# sourceMappingURL=Organizer.js.map
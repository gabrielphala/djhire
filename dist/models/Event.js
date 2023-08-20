"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
exports.default = new (class Event extends sqlifier_1.SQLifier {
    constructor() {
        super();
        this.schema('event', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            organizer_id: { type: 'int', ref: 'organizer' },
            name: { type: 'varchar', length: 55 },
            location: { type: 'varchar', length: 255 },
            start: { type: 'datetime' },
            end: { type: 'datetime' },
            createdOn: { type: 'datetime', default: sqlifier_1.SQLDate.now },
            isDeleted: { type: 'boolean', default: false }
        });
    }
    removeEvent(id) {
        this.update({ id }, { isDeleted: true });
    }
});
//# sourceMappingURL=Event.js.map
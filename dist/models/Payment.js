"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
exports.default = new (class Payment extends sqlifier_1.SQLifier {
    constructor() {
        super();
        this.schema('payment', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            event_id: { type: 'int', ref: 'event' },
            dj_id: { type: 'int', ref: 'dj' },
            organizer_id: { type: 'int', ref: 'organizer' },
            status: { type: 'varchar', length: 20, default: 'requesting' },
            total: { type: 'int', default: 0 },
        });
    }
    getByOrganizer(organizer_id) {
        return this.find({
            condition: {
                organizer_id
            },
            join: [
                {
                    id: 'dj_id',
                    ref: 'dj'
                },
                {
                    id: 'event_id',
                    ref: 'event'
                }
            ]
        });
    }
});
//# sourceMappingURL=Payment.js.map
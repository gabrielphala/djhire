"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
exports.default = new (class PayAlert extends sqlifier_1.SQLifier {
    constructor() {
        super();
        this.schema('dj', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            event_id: { type: 'int', ref: 'event' },
            dj_id: { type: 'int', ref: 'dj' },
            organizer_id: { type: 'int', ref: 'organizer' },
            min_deposit: { type: 'int' },
            full_amount: { type: 'int' },
        });
    }
});
//# sourceMappingURL=PayAlert.js.map
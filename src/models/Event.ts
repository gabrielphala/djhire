import { SQLifier, SQLDate } from "sqlifier"

export default new (class Event extends SQLifier {
    constructor() {
        super();

        this.schema('event', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            organizer_id: { type: 'int', ref: 'organizer' },
            name: { type: 'varchar', length: 55 },
            location: { type: 'varchar', length: 255 },
            start: { type: 'datetime' },
            end: { type: 'datetime' },
            createdOn: { type: 'datetime', default: SQLDate.now },
            isDeleted: { type: 'boolean', default: false }
        })
    }
})
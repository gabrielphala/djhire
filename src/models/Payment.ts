import { SQLifier } from "sqlifier"

export default new (class Payment extends SQLifier {
    constructor() {
        super();

        this.schema('payment', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            event_id: { type: 'int', ref: 'event' },
            dj_id: { type: 'int', ref: 'dj' },
            organizer_id: { type: 'int', ref: 'organizer' },
            status: { type: 'varchar', length: 20, default: 'requesting' },
            total: { type: 'int', default: 0 },
        })
    }

    getByOrganizer (organizer_id) {
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
})
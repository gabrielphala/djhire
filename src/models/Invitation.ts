import { SQLifier } from "sqlifier"

export default new (class Invitation extends SQLifier {
    constructor() {
        super();

        this.schema('invitation', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            invitation_no: { type: 'varchar', length: 5 },
            dj_id: { type: 'int' , ref: 'dj'},
            organizer_id: { type: 'int', ref: 'organizer' },
            event_id: { type: 'int', ref: 'event' },
            status: { type: 'varchar', length: '20', default: 'pending' },
            isDeleted: { type: 'boolean', default: false }
        })
    }

    getOpenDJInvitations (dj_id) {
        return this.find({
            condition: { dj_id, isDeleted: false },
            join: [
                {
                    id: 'dj_id',
                    ref: 'dj'
                },
                {
                    id: 'organizer_id',
                    ref: 'organizer'
                },
                {
                    id: 'event_id',
                    ref: 'event'
                }
            ]
        })
    }

    getEventInvitees (event_id) {
        return this.find({
            condition: { event_id, isDeleted: false },
            join: [
                {
                    id: 'dj_id',
                    ref: 'dj'
                }
            ]
        })
    }
})
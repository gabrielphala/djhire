import { SQLifier, SQLDate } from "sqlifier"

export default new (class Organizer extends SQLifier {
    constructor() {
        super();

        this.schema('organizer', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            fullname: { type: 'varchar', length: 50 },
            email: { type: 'varchar', length: 50 },
            password: { type: 'varchar', length: 250 },
            createdOn: { type: 'datetime', default: SQLDate.now },
            isDeleted: { type: 'boolean', default: false }
        })
    }
})
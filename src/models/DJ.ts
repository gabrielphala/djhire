import { SQLifier, SQLDate } from "sqlifier"

export default new (class DJ extends SQLifier {
    constructor() {
        super();

        this.schema('dj', {
            id: { type: 'int', isAutoIncrement: true, isPrimary: true },
            stage_name: { type: 'varchar', length: 55 },
            min_deposit: { type: 'int', default: 500 },
            full_amount: { type: 'int', default: 3000 },
            email: { type: 'varchar', length: 50 },
            password: { type: 'varchar', length: 250 },
            createdOn: { type: 'datetime', default: SQLDate.now },
            isDeleted: { type: 'boolean', default: false }
        })
    }
})
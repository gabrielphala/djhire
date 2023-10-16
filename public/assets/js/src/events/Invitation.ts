import { Events, Refresh } from "oddlyjs"

import { showError } from "../helpers/error-container";
import { closeModal } from "../helpers/modal";
import fetch from "../helpers/fetch";

export default () => new (class Invitation {
    constructor () {
        new Events(this)
    }

    async accept (event_id, organizer_id) {
        const response = await fetch('/invitation/accept', {
            body: {
                event_id,
                organizer_id
            }
        })

        Refresh();
    }

    async deny (event_id, organizer_id) {
        const response = await fetch('/invitation/deny', {
            body: {
                event_id,
                organizer_id
            }
        })

        Refresh();
    }

    async removeById (invitation_id) {
        const response = await fetch('/invitation/remove', {
            body: {
                invitation_id
            }
        })

        Refresh();
    }
});
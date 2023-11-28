import { Events, Refresh } from "oddlyjs"

import { showError } from "../helpers/error-container";
import { closeModal } from "../helpers/modal";
import fetch from "../helpers/fetch";
import popup from "../helpers/popup";

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

        if (response.successful) {
            return popup({ type: 'success', title: 'Accepted invite', message: 'You have accepted invite' })
        }

        return popup({ type: 'error', title: 'Oops', message: response.error })
    }

    async deny (event_id, organizer_id) {
        const response = await fetch('/invitation/deny', {
            body: {
                event_id,
                organizer_id
            }
        })

        Refresh();

        if (response.successful) {
            return popup({ type: 'success', title: 'Declined invite', message: 'You have successfully declined invite' })
        }

        return popup({ type: 'error', title: 'Oops', message: response.error })
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
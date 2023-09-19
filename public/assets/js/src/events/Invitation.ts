import { Events, Refresh } from "oddlyjs"

import { showError } from "../helpers/error-container";
import { closeModal } from "../helpers/modal";
import fetch from "../helpers/fetch";

export default () => new (class Invitation {
    constructor () {
        new Events(this)
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
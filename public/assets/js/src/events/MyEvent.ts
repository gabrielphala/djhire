import { Events, Next, Environment } from "oddlyjs"

import { showError } from "../helpers/error-container";
import fetch from "../helpers/fetch";

export default () => new (class MyEvent {
    constructor () {
        new Events(this)
    }

    async add (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/event/add', {
            body: {
                name: $('#event-name').val(),
                location: $('#event-location').val(),
                start: $('#event-start').val(),
                end: $('#event-end').val()
            }
        })

        // if (response.successful) {
        //     Environment.put('userDetails', response.userDetails);

        //     return Next('/organizer/event-manager')
        // }

        // showError('auth', response.error)
    }
});
import { Events, Refresh, Environment } from "oddlyjs"

import { showError } from "../helpers/error-container";
import { closeModal } from "../helpers/modal";
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

        if (response.successful) {
            closeModal('new-event')

            return Refresh();
        }

        showError('event', response.error)
    }

    async edit (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/event/edit', {
            body: {
                event_id: $('#event-id').val(),
                name: $('#edit-event-name').val(),
                location: $('#edit-event-location').val(),
                start: $('#edit-event-start').val(),
                end: $('#edit-event-end').val()
            }
        })

        if (response.successful) {
            closeModal('edit-event')

            return Refresh();
        }

        showError('edit-event', response.error)
    }

    async removeEvent (event_id: string) {
        const response = await fetch('/event/remove/by/id', {
            body: {
                event_id
            }
        })

        Refresh();
    }

    async openEditModal (event_id: string) {
        $('#event-id').val(event_id);

        const response = await fetch('/event/get/by/id/' + event_id)

        $('#edit-event-name').val(response.details.name)
        $('#edit-event-location').val(response.details.location)

        // Environment.put('eventId', event_id, true);
    }
});
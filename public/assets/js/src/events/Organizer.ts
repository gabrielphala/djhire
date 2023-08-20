import { Events, Next, Environment } from "oddlyjs"

import { showError } from "../helpers/error-container";
import fetch from "../helpers/fetch";

export default () => new (class Organizer {
    constructor () {
        new Events(this)
    }

    async signUp (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/organizer/sign-up', {
            body: {
                fullname: $('#full-name').val(),
                email: $('#email-address').val(),
                password: $('#password').val(),
                passwordAgain: $('#password-again').val()
            }
        })

        if (response.successful) {
            Environment.put('userInfo', response.userDetails);

            return Next('/organizer/event-manager')
        }

        showError('auth', response.error)
    }

    async signIn (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/organizer/sign-in', {
            body: {
                email: $('#email-address').val(),
                password: $('#password').val()
            }
        })

        if (response.successful) {
            Environment.put('userInfo', response.userDetails);

            return Next('/organizer/event-manager')
        }

        showError('auth', response.error)
    }
});
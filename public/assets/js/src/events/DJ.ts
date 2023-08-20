import { Events, Next, Environment } from "oddlyjs"

import { showError } from "../helpers/error-container";
import fetch from "../helpers/fetch";

import axios from "axios"

export default () => new (class DJ {
    constructor () {
        new Events(this)
    }

    async signUp (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/sign-up', {
            body: {
                stage_name: $('#stage-name').val(),
                email: $('#email-address').val(),
                password: $('#password').val(),
                passwordAgain: $('#password-again').val()
            }
        })

        if (response.successful) {
            Environment.put('userDetails', response.userDetails);

            return Next('/my-schedule')
        }

        showError('auth', response.error)
    }

    async signIn (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/sign-in', {
            body: {
                identifier: $('#identifier').val(),
                password: $('#password').val()
            }
        })

        if (response.successful) {
            Environment.put('userDetails', response.userDetails);

            return Next('/my-schedule')
        }

        showError('auth', response.error)
    }
});
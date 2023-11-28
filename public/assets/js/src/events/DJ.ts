import { Events, Next, Environment, Router, Refresh } from "oddlyjs"

import { showError } from "../helpers/error-container";
import fetch, { uploadImage } from "../helpers/fetch";

import { arrayNotEmpty } from "../helpers/array";
import { getStaticDate } from "../helpers/datetime";
import { closeModal } from "../helpers/modal";
import popup from "../helpers/popup";

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
            Environment.put('userInfo', response.userDetails);

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
            Environment.put('userInfo', response.userDetails);

            return Next('/my-schedule')
        }

        showError('auth', response.error)
    }

    async searchByName () {
        const response = await fetch('/dj/search/by/name', {
            body: {
                dj_name: $('#dj-name').val()
            }
        })

        if (arrayNotEmpty(response.djs)) {
            let text = '';

            for (let i = 0; i < response.djs.length; i++) {
                const dj = response.djs[i];

                const res = await fetch(`/invitations/get/by/dj/${dj.id}`);

                let invites = "";

                if (arrayNotEmpty(res.invitations)) {
                    res.invitations.forEach((inv, index) => {
                        invites += `
                            <ul class="table__body__row flex">
                                <li class="table__body__row__item short" style="padding-left: 0;">${index + 1}</li>
                                <li class="table__body__row__item">${inv.name}</li>
                                <li class="table__body__row__item">${getStaticDate(inv.start)}</li>
                                <li class="table__body__row__item" style="padding-right: 0;">${getStaticDate(inv.end)}</li>
                            </ul>
                        `
                    });
                }

                text += `<div class="dj-container__item">
                    <h4>${dj.stage_name}</h4>
                    <div class="table">
                        <div class="table__header">
                            <ul class="table__header__row flex">
                                <li class="table__header__row__item short" style="padding-left: 0;">#</li>
                                <li class="table__header__row__item">Invitation</li>
                                <li class="table__header__row__item">Starts at</li>
                                <li class="table__header__row__item" style="padding-right: 0;">End at</li>
                            </ul>
                        </div>
                        <div class="table__body" style="box-shadow: none;">
                            ${invites}
                        </div>
                    </div>
                    <p class="send-invitation" data-djid="${dj.id}" data-eventid="${Router.currentRoute.query.get('e')}">Send invitation</p>
                </div>`;
            }

            $('.dj-container').html(text);

            $('.send-invitation').off('click');

            $('.send-invitation').on('click', async e => {
                const { djid, eventid } = e.currentTarget.dataset;

                const addInviteRes = await fetch('/invitation/add', {
                    body: {
                        dj_id: djid,
                        event_id: eventid
                    }
                });

                if (addInviteRes.successful) {
                    Refresh();

                    popup({ type: 'success', title: 'Artist invited', message: 'Successfully invited artist' })

                    return closeModal('add-dj');
                }

                showError('add-dj', addInviteRes.error)
            })

            return;
        }

        $('.dj-container').html('')
    }

    async updateGeneralDetails (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/dj/updates/general-details', {
            body: {
                stage_name: $('#stage-name').val(),
                email: $('#email-address').val()
            }
        })

        if (response.successful) {
            return popup({ type: 'success', title: 'General details changed', message: `Successfully updated general details` })
        }

        return popup({ type: 'error', title: 'Oops', message: response.error })
    }

    async updateProfile (e: PointerEvent) {
        const body = new FormData();

        const files = $('#profile-file')[0] as HTMLInputElement;
        const file = files.files ? files.files[0] : null;

        body.append('profile', file || '');

        Refresh()

        uploadImage('/dj/updates/profile', body);
    }

    async updateRates (e: PointerEvent) {
        e.preventDefault();

        const response = await fetch('/dj/updates/rates', {
            body: {
                min_deposit: $('#min-deposit').val(),
                full_amount: $('#full-amount').val()
            }
        })

        if (response.successful) {
            return popup({ type: 'success', title: 'Rates updated', message: `Successfully updated rates and fees` })
        }

        return popup({ type: 'error', title: 'Oops', message: response.error })
    }
});
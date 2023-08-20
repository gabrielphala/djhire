import { Events, Next } from "oddlyjs"

import { openModal, closeModal } from "../helpers/modal"
import fetch from "../helpers/fetch"

export default () => new (class Util {
    constructor () {
        new Events(this)
    }

    openModal (id: string) {
        openModal(id)
    }

    closeModal (id: string) {
        closeModal(id)
    }

    link (path: string) {
        Next(path)
    }

    signOut () {
        (async () => {
            const res = await fetch('/sign-out');

            Next(res.redirect || '/sign-in')
        })()
    }

    nav (e: PointerEvent) {
        e.preventDefault();

        Next((e.currentTarget as HTMLAnchorElement).href);
    }

    openDropDownMenu () {
        const dropdown = $(`#dropdown-menu`);
        dropdown.removeClass('main-header__nav__ul__item__menu--closed');

        const overlay = $(document.createElement('div'));
        overlay.addClass('overlay');

        overlay.on('click', () => {
            dropdown.addClass('main-header__nav__ul__item__menu--closed');

            overlay.remove();
        });

        document.body.appendChild(overlay[0]);
    }
});
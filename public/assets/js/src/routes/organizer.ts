import { Route } from "oddlyjs"

export default (): void => {
    Route({
        name: 'organizer.sign.up',
        url: '/organizer/sign-up',
        layoutpath: 'auth'
    })

    Route({
        name: 'organizer.sign.in',
        url: '/organizer/sign-in',
        layoutpath: 'auth'
    })

    Route({
        name: 'organizer.event.manager',
        url: '/organizer/event-manager',
        layoutpath: 'info'
    })
}
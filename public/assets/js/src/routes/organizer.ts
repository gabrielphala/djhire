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
        name: 'organizer.payments',
        url: '/organizer/payments',
        layoutpath: 'info'
    })

    Route({
        name: 'organizer.pay',
        url: '/organizer/pay',
        layoutpath: 'info'
    })

    Route({
        name: 'organizer.event.manager',
        url: '/organizer/event-manager',
        layoutpath: 'info'
    })

    Route({
        name: 'organizer.event.view',
        url: '/organizer/event-view',
        layoutpath: 'info'
    })
}
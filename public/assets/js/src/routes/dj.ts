import { Route } from "oddlyjs"

export default (): void => {
    Route({
        name: 'dj.sign.up',
        url: '/sign-up',
        layoutpath: 'auth'
    })

    Route({
        name: 'dj.sign.in',
        url: '/sign-in',
        layoutpath: 'auth'
    })

    Route({
        name: 'dj.schedule',
        url: '/my-schedule',
        layoutpath: 'info'
    })

    Route({
        name: 'dj.profile',
        url: '/profile',
        layoutpath: 'info'
    })

    Route({
        name: 'dj.profile.fees',
        url: '/profile/fees',
        layoutpath: 'info'
    })
}
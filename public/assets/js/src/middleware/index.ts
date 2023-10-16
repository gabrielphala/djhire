declare var paypal;

import { Middleware, Router, Environment, Next } from "oddlyjs"
import fetch from "../helpers/fetch";
import { makePayment } from "../events/Payment";

export default () => {
    Middleware.repeat(async (next: Function) => {
        Environment.put(
            'userInfo',
            (await fetch('/user/get/by/session')).userInfo,
            true
        )

        next()
    })

    Router.use('organizer.pay').onDOMLoaded(() => {
        const price = parseInt(Router.currentRoute.query.get('p') as string);
        const paymentId = parseInt(Router.currentRoute.query.get('i') as string);

        if (price < 50) return;

        paypal.Buttons({
            // Set up the transaction
            createOrder: async function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: Math.round(price / 18)
                        }
                    }]
                });
            },

            // Finalize the transaction
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (orderData) {
                    // oder id = orderData.id
                    
                    makePayment(price, paymentId);

                    Next('/organizer/payments')
                });
            }


        }).render('#paypal-button-container');

    })
}
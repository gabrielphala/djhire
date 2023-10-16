import { Events, Refresh } from "oddlyjs"

import { showError } from "../helpers/error-container";
import { closeModal } from "../helpers/modal";
import fetch from "../helpers/fetch";

export const makePayment = async  (amount, id) => {
    const response = await fetch('/payment/pay', {
        body: {
            amount,
            id
        }
    })
}
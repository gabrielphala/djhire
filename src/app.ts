import dotenv from "dotenv"
dotenv.config()

import express, { Application } from "express"
import loaders from "./loaders";

import { getPort } from "./config/env";

const app: Application = express();

(() => {
    loaders(app);

    app.use(express.static('public'));

    app.listen(getPort(), () => {
        console.log(`Running on port: ${getPort()}`);
    });
})()
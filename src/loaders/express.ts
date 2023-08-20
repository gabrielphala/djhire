import express, { Application } from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts"
import "../config/database";
import routes from "../api/routes";


export default async (app: Application) => {
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(`${__dirname}/../../src/views`));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(expressLayouts);

    routes(app);
};

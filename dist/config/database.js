"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlifier_1 = require("sqlifier");
const conn = new sqlifier_1.Connection();
conn.createConnection('127.0.0.1', 'root', process.env.NODE_ENV == 'development' ? '' : process.env.ROOT_PASS, require('mysql'));
conn.createDatabase('djhire');
//# sourceMappingURL=database.js.map
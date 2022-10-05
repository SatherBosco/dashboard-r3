"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app/app");
new app_1.App().server.listen(3636, () => console.log("Server is running! Port: 3636"));

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const healthController_1 = __importDefault(require("./controllers/healthController"));
const upload_1 = __importDefault(require("./middlewares/upload"));
const financeiroController_1 = __importDefault(require("./controllers/financeiroController"));
const authManagerController_1 = __importDefault(require("./controllers/authManagerController"));
const routes = (0, express_1.Router)();
const upload = (0, multer_1.default)(upload_1.default);
// HEALTH -----------------------------------------------------------------------
routes.get("/health/", healthController_1.default.health);
routes.get("/health/dashboard-version", healthController_1.default.dashboardVersion);
routes.get("/health/server-version", healthController_1.default.serverVersion);
// AUTH -------------------------------------------------------------------------
routes.post("/auth/authenticate", new authManagerController_1.default().authenticate);
// // routes.use(authVerify); // MIDDLEWARE JWT ---------------------------------------
// routes.post("/auth/register", AuthController.register);
// routes.post("/auth/change-password", AuthController.changePassword);
routes.get("/financeiro/", financeiroController_1.default.getAll);
routes.post("/financeiro/", upload.fields([{ name: 'planilha', maxCount: 1 }]), financeiroController_1.default.updateData);
exports.default = routes;

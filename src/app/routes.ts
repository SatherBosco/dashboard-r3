import { Router } from "express";
import multer from "multer";

import HealthController from "./controllers/healthController";

import uploadConfig from "./middlewares/upload";
import FinanceiroController from "./controllers/financeiroController";
import RavexController from "./controllers/ravexController";
import AuthManagerController from "./controllers/authManagerController";
import DevolutionController from "./controllers/devolutionController";

const routes = Router();

const upload = multer(uploadConfig);

// HEALTH -----------------------------------------------------------------------
routes.get("/health/", HealthController.health);
routes.get("/health/dashboard-version", HealthController.dashboardVersion);
routes.get("/health/server-version", HealthController.serverVersion);

// AUTH -------------------------------------------------------------------------
routes.post("/auth/authenticate", new AuthManagerController().authenticate);
// // routes.use(authVerify); // MIDDLEWARE JWT ---------------------------------------
// routes.post("/auth/register", AuthController.register);
// routes.post("/auth/change-password", AuthController.changePassword);

routes.get("/financeiro/", FinanceiroController.getAll);
routes.post("/financeiro/", upload.fields([{ name: "planilha", maxCount: 1 }]), FinanceiroController.updateData);
routes.post(
    "/ravex/",
    upload.fields([
        { name: "ravex", maxCount: 1 },
        { name: "devolucoes", maxCount: 1 },
    ]),
    RavexController.manipulateData
);

// DEVOLUCOES -------------------------------------------------------------------------
routes.get("/devolution/", DevolutionController.getAll);
routes.post("/devolution/", upload.fields([{ name: "devolucoes", maxCount: 1 }]), DevolutionController.setDevolutions);
routes.post("/devolution/:id", DevolutionController.update);

export default routes;

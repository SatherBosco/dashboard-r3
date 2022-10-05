import "dotenv/config";
import { App } from "./app/app";

new App().server.listen(3636, () => console.log("Server is running! Port: 3636"));

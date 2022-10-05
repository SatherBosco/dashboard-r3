"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const upload_1 = __importDefault(require("../middlewares/upload"));
class DriveStorage {
    constructor() {
        this.GOOGLE_API_FOLDER_ID = "11aLYfc5fIR9VgsSTH7SfMZCh4J5VqYpL";
    }
    uploadFile(filename, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const originalPath = path_1.default.resolve(upload_1.default.directory, filename);
                const auth = new googleapis_1.google.auth.GoogleAuth({
                    keyFile: "./src/configs/googleConfigs.json",
                    scopes: ["https://www.googleapis.com/auth/drive"],
                });
                const driveService = googleapis_1.google.drive({
                    version: "v3",
                    auth,
                });
                const fileMetadata = {
                    name: filename,
                    parents: [this.GOOGLE_API_FOLDER_ID],
                };
                const media = {
                    mimeType: contentType,
                    body: fs_1.default.createReadStream(originalPath),
                };
                const response = yield driveService.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: "id",
                });
                if (!response.data.id || response.data.id === undefined)
                    return { sucess: false, message: "Erro no upload para o Drive" };
                return { sucess: true, message: response.data.id };
            }
            catch (error) {
                return { sucess: false, message: "Erro ao fazer upload da imagem" };
            }
        });
    }
}
exports.default = DriveStorage;

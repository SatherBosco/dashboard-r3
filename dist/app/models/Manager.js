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
exports.Role = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
var Role;
(function (Role) {
    Role[Role["Master"] = 0] = "Master";
    Role[Role["Director"] = 1] = "Director";
    Role[Role["Manager"] = 2] = "Manager";
})(Role = exports.Role || (exports.Role = {}));
const ManagerSchema = new mongoose_1.default.Schema({
    cpf: {
        type: String,
        unique: true,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
ManagerSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
ManagerSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield bcrypt_1.default.hash(this.password, 10);
        this.password = hash;
        next();
    });
});
ManagerSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = this;
        return bcrypt_1.default.compare(candidatePassword, manager.password).catch((e) => false);
    });
};
exports.default = mongoose_1.default.model("Manager", ManagerSchema);

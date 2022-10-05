import mongoose from "mongoose";
import bcrypt from "bcrypt";

export enum Role {
    Master,
    Director,
    Manager,
}

export interface ManagerInput {
    cpf: string;
    firstName: string;
    lastName: string;
    password: string;
    unit: string;
    role: Role;
}

export interface ManagerDocument extends ManagerInput, mongoose.Document {
    fullName: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const ManagerSchema = new mongoose.Schema({
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

ManagerSchema.virtual("fullName").get(function (this: ManagerDocument) {
    return `${this.firstName} ${this.lastName}`;
});

ManagerSchema.pre("save", async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

ManagerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const manager = this as ManagerDocument;

    return bcrypt.compare(candidatePassword, manager.password).catch((e) => false);
};

export default mongoose.model<ManagerDocument>("Manager", ManagerSchema);

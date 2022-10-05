import mongoose from "mongoose";

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

export default function Database() {
    mongoose
        .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.3tj2idh.mongodb.net/r3database?retryWrites=true&w=majority`)
        .then(() => {
            console.log("Conectou ao banco de dados!");
        })
        .catch((err) => console.log(err));

    mongoose.Promise = global.Promise;
}

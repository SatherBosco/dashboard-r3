import fs from "fs";
import path from "path";
import upload from "../middlewares/upload";

class DeleteFiles {
    async delete() {
        try {
            const directory = upload.directory;

            fs.readdir(directory, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(directory, file), (err) => {
                        if (err) throw err;
                    });
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}

export default DeleteFiles;

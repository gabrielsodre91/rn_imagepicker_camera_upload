const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "..", "images"));
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);

            file.key = `${hash.toString("hex")}-${file.originalname}`;

            cb(null, file.key);
        });
    }
});

module.exports = {
    dest: path.resolve(__dirname, "..", "imagess"),
    storage
};
const routes = require('express').Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

routes.post('/uploadImage', multer(multerConfig).single("imagem"), (req, res) => {
    res.json(req.file);
});

module.exports = routes;
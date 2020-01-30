const express = require('express');
const routes = require('./routes');
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.use(
    "/imagens",
    express.static(path.resolve(__dirname, "images"))
  );

app.listen(3000);
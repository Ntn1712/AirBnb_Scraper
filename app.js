const express = require("express");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const indexRouter = require("./routes/index");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use("", indexRouter);

app.listen(3000, () => {
    console.log("Connected Successfully");
})




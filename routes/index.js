var express = require('express');
var router = express.Router();
var puppeteer = require("puppeteer");
var cheerio = require("cheerio");

router.get('/', function (req, res, next) {
    res.render("index");
});

router.post("/", async (req, res, next) => {
    var place = req.body.place;
    var search = encodeURIComponent(place).replace(/%2C%20/g, "--");
    console.log(search);
    const uri = "https://www.airbnb.com/s/" + search + "/homes?refinement_paths%5B%5D=%2Fhomes&screen_size=medium&search_type=search_query";
    let browser;

    async function scrape(url) {
        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });
            const html = await page.evaluate(() => document.body.innerHTML);
            const $ = await cheerio.load(html);
            const home = $('[itemprop="itemListElement"] > div > div._ylefn59 > a ').map((i, element) => {
                return "https://www.airbnb.com" + $(element).attr("href");
            }).get();
            return home;
        } catch (err) {
            console.error(err);
        }
    }

    async function scrapeDesc(url, page) {
        try {
            await page.goto(url, { waitUntil: "networkidle2" });
            const html = await page.evaluate(() => document.body.innerHTML);
            const $ = await cheerio.load(html);
            const price = $("#room > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span > span").text();
            const name = $("#summary > div > div > div:nth-child(1) > div > div > div._1hpgssa1 > div:nth-child(1) > div > span > h1 > span").text();
            const roomText = $("#room").text();
            const guestsAllowed = returnMatch(roomText, /\d+ [ a-z ]*guest/);
            const bedrooms = returnMatch(roomText, /([+-]?(\d*\.)?\d+ [ a-z ]*bedroom)|(Studio)/);
            const baths = returnMatch(roomText, /[+-]?(\d*\.)?\d+ [ a-z ]*bath/);
            const beds = returnMatch(roomText, /[+-]?(\d*\.)?\d+ [ a-z ]*bed/);
            return { url, name, price, guestsAllowed, bedrooms, baths, beds };
        } catch (err) {
            console.error(err);
        }
    }

    function returnMatch(roomText, regex) {
        const regexMatch = roomText.match(regex);
        let results = "N/A";
        if (regexMatch.length != null) {
            results = regexMatch[0];
        } else {
            throw 'No regex match';
        }
        return results;
    }

    async function main() {
        browser = await puppeteer.launch({ headless: false });
        const descPage = await browser.newPage();
        const home = await scrape(uri);
        var arr = [];
        for (var i = 0; i < home.length; i++) {
            const result = await scrapeDesc(home[i], descPage);
            arr.push(result);
        }
        res.send(arr);
    }
    main();
})

module.exports = router;
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

// const sample = {
//     price: 1000,
//     guests: 1,
//     bedrooms: 1,
//     beds: 1,
//     baths: 1,
// };

app.use("", indexRouter);


const uri = "https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&search_type=pagination&place_id=ChIJkbeSa_BfYzARphNChaFPjNc&s_tag=CSmPdSok&hide_dates_and_guests_filters=false";

let browser;

async function scrape(url){
    try{
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);
        const home = $('[itemprop="itemListElement"] > div > div._ylefn59 > a ').map((i, element) => {
            return "https://www.airbnb.co.in" + $(element).attr("href");
        }).get();
        return home;
    }catch(err){
        console.error(err);
    }   
}

async function scrapeDesc(url, page){
    try{
        await page.goto(url, { waitUntil: "networkidle2" });
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);
        const price = $("#room > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span > span").text();
        const roomText = $("#room").text();
        const guestsAllowed = returnMatch(roomText, /\d+ guest/);
        const bedrooms = returnMatch(roomText, /\d+ bedroom/);
        const baths = returnMatch(roomText, /\d+ (shared )?bath/);
        const beds = returnMatch(roomText, /\d+ bed/);
        return {url, price, guestsAllowed, bedrooms, baths, beds};
    } catch(err){
        console.error(err);
    }
}

function returnMatch(roomText, regex){
    const regexMatch = roomText.match(regex);
    let results = "N/A";
    if(regexMatch.length != null){
        results = regexMatch[0];
    } else {
        throw 'No regext match';
    }
    return results;
}

async function main(){
    browser = await puppeteer.launch({headless: false});
    const descPage = await browser.newPage();
    const home = await scrape(uri);
    for(var i =0; i<home.length;i++){
        const result = await scrapeDesc(home[i], descPage);
        res.send(result);
    }
}

app.listen(3000, () => {
    console.log("Connected Successfully");
})

// main();


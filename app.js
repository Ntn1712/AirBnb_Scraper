var puppeteer = require("puppeteer");
var cherrio = require("cheerio");

const sample = {
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    price: 1550,
};


// https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&screen_size=large&search_type=search_query

// https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&search_type=pagination&place_id=ChIJkbeSa_BfYzARphNChaFPjNc&s_tag=CSmPdSok&hide_dates_and_guests_filters=false&last_search_session_id=acd5389c-f895-4728-bdd5-b0c48d6bf782

// https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&search_type=pagination&place_id=ChIJkbeSa_BfYzARphNChaFPjNc&s_tag=CSmPdSok&hide_dates_and_guests_filters=false&{`section_offset=4&items_offset=18`}&last_search_session_id=2c80cd67-94f6-422b-b758-090d25113219

// https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&screen_size=large&search_type=pagination&place_id=ChIJkbeSa_BfYzARphNChaFPjNc&s_tag=CSmPdSok&{`section_offset=4&items_offset=18`}&last_search_session_id=c9247eb5-aa14-4742-8eb8-100ee030f2e9

const uri = "https://www.airbnb.co.in/s/india/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&search_type=pagination&place_id=ChIJkbeSa_BfYzARphNChaFPjNc&s_tag=CSmPdSok&hide_dates_and_guests_filters=false";

async function scrape(url){
    try{
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cherrio.load(html);
        const home = $('[itemprop="itemListElement"] > div > div._ylefn59 > a ').map((i, element) => {
            return "https://www.airbnb.co.in" + $(element).attr("href");
        }).get();
        return home;
    }catch(err){
        console.error(err);
    }   
}

async function main(){
    const home = await scrape(uri);
    console.log(home);
}

main();


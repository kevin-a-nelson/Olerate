const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const SIS_PROFS = require("./SISProfs");

const MAP_RMP_TO_SIS = require("./mapRMPToSIS.js");
const MAP_RMP_TO_SIS_2 = require("./mapRMPToSIS2.js");

const fuzzysort = require("fuzzysort");

// Scrape RMT Profs
// Scrape SIS Profs
// Map RMT to SIS
// Scrape RMT Profs
//

const UNMATCHED_PROFS = [];

const PROF_NOT_FOUND = "PROF_NOT_FOUND";

async function scrapeNumOfProfs() {
    const response = await axios.get(
        `https://www.ratemyprofessors.com/search.jsp?query=St.+Olaf&queryoption=HEADER&stateselect=&country=&dept=&queryBy=teacherName&facetSearch=true&schoolName=&offset=0&max=20`
    );
    const $ = await cheerio.load(response.data);
    const resultsText = $(".toppager-left > .result-count").text();
    const numOfProfs = +resultsText.split(" ")[3];
    return numOfProfs;
}

async function scrapeProfsLinksOnPage(page) {
    const response = await axios.get(
        `https://www.ratemyprofessors.com/search.jsp?query=St.+Olaf&queryoption=HEADER&stateselect=&country=&dept=&queryBy=teacherName&facetSearch=true&schoolName=&offset=${
            page * 20
        }&max=20`
    );
    const $ = cheerio.load(response.data);
    const profLinkElems = $(".PROFESSOR > a");
    const numOfProfLinks = profLinkElems.length;
    let profLinks = [];
    for (let i = 0; i < numOfProfLinks; i++) {
        const profLink = profLinkElems[i].attribs.href;
        profLinks.push(profLink);
    }
    return profLinks;
}

async function scrapeProfLinks(numOfPages) {
    let profLinks = [];
    for (var i = 0; i < numOfPages; i++) {
        const profLinksOnPage = await scrapeProfsLinksOnPage(i);
        profLinks.push(profLinksOnPage);
    }

    profLinks = [].concat.apply([], profLinks);

    return profLinks;
}

function getDifficulty(feedback) {
    let difficulty = feedback;
    if (feedback.includes("%")) {
        difficulty = feedback.split("%")[1];
    }
    return difficulty;
}

function getWouldTakeAgain(feedback) {
    let wouldTakeAgain = "---";
    if (feedback.includes("%")) {
        wouldTakeAgain = feedback.split("%")[0];
    }
    return wouldTakeAgain;
}

function formatName(name) {
    // Kevin Nelson => Nelson, Kevin
    name = name.trim();
    const splitName = name.split(" ");

    if (splitName.length !== 2) {
        return name;
    }

    let firstName = splitName[0];
    let lastName = splitName[1];

    const formattedName = `${lastName}, ${firstName}`;

    if (!SIS_PROFS.hasOwnProperty(formattedName)) {
        UNMATCHED_PROFS.push = name;
    }

    return formattedName;
}

async function scrapeProf(profLink) {
    const response = await axios.get(
        `https://www.ratemyprofessors.com/${profLink}`
    );
    const $ = cheerio.load(response.data);
    let name = $(".NameTitle__Name-dowf0z-0").text();

    name = name.trim();
    name = name.split(" ");
    name = name.reverse();
    name = name.join(" ");

    // if (MAP_RMP_TO_SIS_2[name]) {
    //     name = MAP_RMP_TO_SIS_2[name];
    // } else if (MAP_RMP_TO_SIS[name]) {
    //     name = MAP_RMP_TO_SIS[name];
    // } else {
    //     UNMATCHED_PROFS.push(name);
    // }

    // if (!SIS_PROFS.hasOwnProperty(formattedName)) {
    //     UNMATCHED_PROFS.push = name;
    // }
    // const formattedName = formatName(name);
    // const rating = $(".RatingValue__Numerator-qw8sqy-2").text();
    // const feedback = $(".FeedbackItem__FeedbackNumber-uof32n-1").text();
    // const reviews = +$(".hDaWgM > a").text().slice(0, 2);
    // const difficulty = getDifficulty(feedback);
    // const wouldTakeAgain = getWouldTakeAgain(feedback);

    // ShowRatings.jsp?tid=69265 -> [ShowRatings.jsp?tid, 69265] -> 69265
    const id = profLink.split("=")[1];

    const prof = { id, name };
    console.log(prof);
    return prof;
}

function writeProfs(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}

async function getProfs(profLinks) {
    let profs = {};
    for (let i = 0; i < profLinks.length; i++) {
        const profLink = profLinks[i];
        const prof = await scrapeProf(profLink);
        profs[prof.name] = prof.id;

        // delete profs[prof.name].name;
    }
    return profs;
}

async function scrapeProfs() {
    const numOfProfs = await scrapeNumOfProfs();
    const numOfPages = Math.ceil(numOfProfs / 20);
    const profLinks = await scrapeProfLinks(numOfPages);
    const profs = await getProfs(profLinks);
    const profsToWrite =
        "const RMP_PROFS = " +
        JSON.stringify(profs) +
        "; module.exports = RMP_PROFS";
    writeProfs("RMPProfs.js", profsToWrite);
    writeProfs(
        "unFoundProfs.js",
        `
        const UNFOUND_PROFS = ${JSON.stringify(UNMATCHED_PROFS)};
        module.exports = UNFOUND_PROFS;
    `
    );
}

scrapeProfs();

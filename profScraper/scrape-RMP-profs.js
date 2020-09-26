const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

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

async function scrapeProf(profLink) {
    const response = await axios.get(
        `https://www.ratemyprofessors.com/${profLink}`
    );
    const $ = cheerio.load(response.data);
    let name = $(".NameTitle__Name-dowf0z-0").text();
    let rating = $(".RatingValue__Numerator-qw8sqy-2").text();

    name = name.trim();
    name = name.split(" ");
    name = name.reverse();
    name = name.join(" ");

    const id = profLink.split("=")[1];

    const prof = { id, name, rating };
    console.log(prof);
    return prof;
}

function writeFile(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`${file} created!`);
    });
}

async function getProfs(profLinks) {
    let profs = {};
    for (let i = 0; i < profLinks.length; i++) {
        const profLink = profLinks[i];
        const prof = await scrapeProf(profLink);
        profs[prof.name] = prof;
    }
    return profs;
}

function createFileContents(varName, body) {
    return `const ${varName} = ${body}; module.exports = ${varName}`;
}

async function scrapeProfs() {
    const numOfProfs = await scrapeNumOfProfs();
    const numOfPages = Math.ceil(numOfProfs / 20);
    const profLinks = await scrapeProfLinks(numOfPages);
    const profs = await getProfs(profLinks);
    const RMPProfsContents = createFileContents(
        "RMP_PROFS",
        JSON.stringify(profs)
    );
    writeFile("RMP-profs.js", RMPProfsContents);
}

scrapeProfs();

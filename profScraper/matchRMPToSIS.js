const SIS_PROFS = require("./SISProfs.js");
const RMP_PROFS = require("./RMPProfs");
const fuzzysort = require("fuzzysort");
const stringSimilarity = require("string-similarity");
const fs = require("fs");

const results = stringSimilarity.findBestMatch("Hall-Holt Olaf", SIS_PROFS);

const RMPProfNames = Object.keys(RMP_PROFS);

function writeProfs(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}

bestMatches = {};
// bestMatches["0.9"] = {};
// bestMatches["0.8"] = {};
// bestMatches["0.7"] = {};
// bestMatches["0.6"] = {};
// bestMatches["0.5"] = {};
// bestMatches["0.4"] = {};
// bestMatches["0.3"] = {};
// bestMatches["0.2"] = {};
// bestMatches["0.1"] = {};

RMPProfNames.forEach((RMPProfName) => {
    const results = stringSimilarity.findBestMatch(RMPProfName, SIS_PROFS);

    if (results.bestMatch.rating >= 0.6) {
        bestMatches[RMPProfName] = results.bestMatch.target;
    }

    // if (results.bestMatch.rating >= 0.9 && results.bestMatch.rating <= 1) {
    //     bestMatches["0.9"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.8 && results.bestMatch.rating <= 0.9) {
    //     bestMatches["0.8"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.7 && results.bestMatch.rating <= 0.8) {
    //     bestMatches["0.7"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.6 && results.bestMatch.rating <= 0.7) {
    //     bestMatches["0.6"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.5 && results.bestMatch.rating <= 0.6) {
    //     bestMatches["0.5"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.4 && results.bestMatch.rating <= 0.5) {
    //     bestMatches["0.4"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.3 && results.bestMatch.rating <= 0.4) {
    //     bestMatches["0.3"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.2 && results.bestMatch.rating <= 0.3) {
    //     bestMatches["0.2"][RMPProfName] = results.bestMatch.target;
    // }

    // if (results.bestMatch.rating >= 0.1 && results.bestMatch.rating <= 0.2) {
    //     bestMatches["0.1"][RMPProfName] = results.bestMatch.target;
    // }
});

writeProfs(
    "mapRMPToSIS.js",
    `
    const MAP_RMP_TO_SIS = ${JSON.stringify(bestMatches)};
    module.exports = MAP_RMP_TO_SIS;
`
);

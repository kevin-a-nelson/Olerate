const SIS_PROFS = require("./SIS-profs.js");
const RMP_PROFS = require("./RMP-profs");
const MANUAL_RMP_TO_SIS = require("./manual-RMP-to-SIS");
const stringSimilarity = require("string-similarity");
const fs = require("fs");

const RMP_PROF_NAMES = Object.keys(RMP_PROFS);
const BEST_MATCHES = {};
const UNMATCHED_PROFS = {};

function writeFile(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`${file} created!`);
    });
}

RMP_PROF_NAMES.forEach((RMPProfName) => {
    const results = stringSimilarity.findBestMatch(RMPProfName, SIS_PROFS);
    if (MANUAL_RMP_TO_SIS[RMPProfName]) {
        BEST_MATCHES[RMPProfName] = MANUAL_RMP_TO_SIS[RMPProfName];
    } else if (results.bestMatch.rating >= 0.6) {
        BEST_MATCHES[RMPProfName] = results.bestMatch.target;
    } else {
        UNMATCHED_PROFS[RMPProfName] = results.bestMatch.target;
    }
});

function createFileContents(varName, body) {
    return `const ${varName} = ${body}; module.exports = ${varName}`;
}

const RMPToSISContents = createFileContents(
    "RMP_TO_SIS",
    JSON.stringify(BEST_MATCHES)
);

const UnmatchedProfsContent = createFileContents(
    "UNMATCHED_PROFS",
    JSON.stringify(UNMATCHED_PROFS)
);

writeFile("RMP-to-SIS.js", RMPToSISContents);
writeFile("unmatched-profs.js", UnmatchedProfsContent);

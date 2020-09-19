const MAP_RMP_TO_SIS = require("./mapRMPToSIS.js");
const MAP_RMP_TO_SIS_2 = require("./mapRMPToSIS2.js");
let RMPProfs = require("./RMPProfs.js");
const SIS_PROFS = require("./SISProfs.js");
const fs = require("fs");

const RMPProfNames = Object.keys(RMPProfs);

const MAPPED_RMP_PROFS = {};

function writeProfs(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}

RMPProfNames.forEach((RMPProfName) => {
    const profData = RMPProfs[RMPProfName];
    if (MAP_RMP_TO_SIS_2[RMPProfName]) {
        RMPProfName = MAP_RMP_TO_SIS_2[RMPProfName];
    } else if (MAP_RMP_TO_SIS[RMPProfName]) {
        RMPProfName = MAP_RMP_TO_SIS[RMPProfName];
    }
    if (SIS_PROFS[RMPProfName]) {
        RMPProfName = SIS_PROFS[RMPProfName];
        MAPPED_RMP_PROFS[RMPProfName] = profData;
    }
});

writeProfs(
    "mappedRMPProfs.js",
    `const MAPPED_RMP_PROFS = ${JSON.stringify(MAPPED_RMP_PROFS)};
        module.exports = MAPPED_RMP_PROFS;
    `
);

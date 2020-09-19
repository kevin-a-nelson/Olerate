const RMP_PROFS = require("./RMP-profs");
const RMP_TO_SIS = require("./RMP-to-SIS");
const fs = require("fs");

const mappedRMPProfs = {};

function writeFile(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}

function createFileContents(varName, body) {
    return `const ${varName} = ${body}; module.exports = ${varName}`;
}

for (let RMPProfName in RMP_PROFS) {
    const SISProfName = RMP_TO_SIS[RMPProfName];

    if (SISProfName) {
        mappedRMPProfs[SISProfName] = RMP_PROFS[RMPProfName];
    }
}

const mappedRMPProfsContents = createFileContents(
    "MAPPED_RMP_PROFS",
    JSON.stringify(mappedRMPProfs)
);

writeFile("mapped-RMP-profs.js", mappedRMPProfsContents);

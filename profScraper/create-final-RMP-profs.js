const RMP_PROFS = require("./RMP-profs");
const RMP_TO_SIS = require("./RMP-to-SIS");
const fs = require("fs");

const finalRMPProfs = {};

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
        finalRMPProfs[SISProfName] = RMP_PROFS[RMPProfName];
    }
}

writeFile("final-RMP-profs.json", JSON.stringify(finalRMPProfs));

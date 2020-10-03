const RMP_PROFS = require("./RMP-profs");
const RMP_TO_SIS = require("./RMP-to-SIS");
const ENV = require("./env.js")

const fs = require("fs");

const finalRMPProfs = {};

function writeFile(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`${file} created!`);
    });
}

for (let RMPProfName in RMP_PROFS) {
    const SISProfName = RMP_TO_SIS[RMPProfName];

    if (SISProfName) {
        const RMPProf = RMP_PROFS[RMPProfName]
        const finalRMPProf = `${RMPProf.id}:${RMPProf.rating}`
        finalRMPProfs[SISProfName] = finalRMPProf;
    }
}

const nameOfFile = ENV.isProd ? "final-RMP-profs.json" : "test-RMP-profs.json"

writeFile(nameOfFile, JSON.stringify(finalRMPProfs));

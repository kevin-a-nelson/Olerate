const axios = require("axios");
const cheerio = require("cheerio");

const fs = require("fs");

function replace(str, toReplace, replaceWith) {
    for (let i = 0; i < str; i++) {
        if (str[i] === toReplace) {
            str[i] = replaceWith;
        }
    }
    return str;
}

function formatProfessor(professor) {
    let splitProfessor = professor.split(" ");
    // splitProfessor = replace(splitProfessor, ",", "");
    if (splitProfessor.length === 2 || splitProfessor.length === 3) {
        const firstName = splitProfessor[1];
        const lastName = splitProfessor[0];
        return `${lastName} ${firstName}`;
    }
    return professor;
}

function writeProfs(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}

async function scrapeProfs() {
    const response = await axios.get(
        "https://sis.stolaf.edu/sis/public-aclasslab.cfm"
    );
    const $ = await cheerio.load(response.data);
    const dropDowns = $("select").attr("name", "searchfsnum");
    const facilityDropDown = dropDowns[3];
    const facilityDropDownOptions = facilityDropDown.children;

    const facilityProfs = [];

    facilityDropDownOptions.forEach((option, idx) => {
        if (idx === 1) {
            return;
        }
        if (option.children) {
            let professor = option.children[0].data;
            facilityProfs.push(professor);
        }
    });
    writeProfs(
        "SISProfs.js",
        `const SIS_PROFS = ${JSON.stringify(
            facilityProfs
        )}; module.exports = SIS_PROFS`
    );
}

scrapeProfs();

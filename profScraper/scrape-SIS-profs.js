const axios = require("axios");
const cheerio = require("cheerio");

const fs = require("fs");

function writeProfs(file, profs) {
    fs.writeFile(file, profs, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`${file} created!`);
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
            let splitProfessor = professor.split(" ")
            if(splitProfessor.length >= 3) {
                professor = `${splitProfessor[0]} ${splitProfessor[1]}`
            } 
            facilityProfs.push(professor);
        }
    });
    writeProfs(
        "SIS-profs.js",
        `const SIS_PROFS = ${JSON.stringify(
            facilityProfs
        )}; module.exports = SIS_PROFS`
    );
}

scrapeProfs();

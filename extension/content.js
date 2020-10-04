/*
================================================
    Globals
================================================
*/

const results = document.getElementById("results");
const searchButton = document.getElementsByName("searchbutton")[0];
const hardCodedRMPData = HARD_CODED_RMP_DATA

/*
================================================
    UI Logic
================================================
*/

// init message
const form = document.getElementsByTagName("form")[0];
const paragraphElement = document.createElement("P");
paragraphElement.className = "sis-flash sis-flash-success";
const paragraphTextNode = document.createTextNode( "Olerate is Activated! Click the 'Search' button up above to begin");
paragraphElement.appendChild(paragraphTextNode);
form.appendChild(paragraphElement);

const setMessageToLoading = () => {
    paragraphElement.innerText = "Loading rate my professor links ( may take up to 15 seconds ) ...";
    paragraphElement.className = "sis-flash sis-flash-primary";
    results.style.display = "none";
};

const setMessageToSuccess = () => {
    paragraphElement.className = "sis-flash sis-flash-success";
    paragraphElement.innerText = "Success! Click on a professor to go to their rate my professor page!";
    results.style.display = "";
};

const setMessageToNothing = () => {
    paragraphElement.className = "";
    paragraphElement.innerText = "";
    results.style.display = "";
};

// Change Instructor(s) to Instructor(rating)
function setInstructorLabel() {
    const instructor = document.getElementsByClassName("course--instructor")[0];
    instructor.innerText = "Instructor\n(rating)"
}


/*
================================================
    Logic for inserting profs ratings
    when search button is clicked
================================================
*/

function formatProfessor(professor) {
    let splitProfessor = professor.split(" ");
    if (splitProfessor.length === 3) {
        const firstName = splitProfessor[0];
        const lastName = splitProfessor[1];
        professor = `${firstName} ${lastName}`;
    }
    return professor;
}

const insertProfRating = (profElement, RMPProf, professor) => {
    if (RMPProf) {
        const ProfRating = RMPProf.split(":")[1]
        const ProfId = RMPProf.split(":")[0]
        profElement.innerText = `${professor} (${ProfRating})`;
        profElement.href = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${ProfId}`;
        profElement.target = "_blank";
    } else {
        profElement.innerText = `${professor}\n(Not Found)`;
        profElement.href = "javascript:void(0)";
        profElement.style.textDecoration = "none";
        profElement.style.color = "black";
    }
}

const insertProfessorRatings = (RMPProfs) => {
    const elementsWithLinks = document.getElementsByClassName(
        "sis-nounderline"
    );

    const profElements = Array.from(elementsWithLinks).filter(
        (element) => {
            return element.innerText.includes(",");
        }
    );

    for (let i = 0; i < profElements.length; i++) {
        let professor = profElements[i].innerText;
        // professor = formatProfessor(professor);
        const RMPProf = RMPProfs[professor]
        insertProfRating(profElements[i], RMPProf, professor)
    }
};

const coursesFound = () => {
    const resultsText = results.innerText;
    return !resultsText.includes("No classes found");
};

const onSearchButtonClick = (RMPData) => {
    const coursesAreLoaded = () => {
        setMessageToLoading();
        if (!searchButton.disabled) {
            if (coursesFound()) {
                setInstructorLabel();
                setMessageToSuccess();
                insertProfessorRatings(RMPData);
            } else {
                setMessageToNothing();
            }
            // Stop checking if courses are loaded when courses are loaded
            clearInterval(coursesAreLoadedInterval);
        }
    }

    // Check if courses are loaded every second
    const coursesAreLoadedInterval = setInterval(coursesAreLoaded, 100);
};

/*
================================================
    Logic for deciding whether to use
        - Hard Coded Data
        - Local Storage Data
        - Or Fetched Data
================================================
*/

function dataFetchedLessThanTenMinAgo() {
    if(!localStorage.RMPData) {
        return false
    }
    const RMPData = JSON.parse(localStorage.RMPData)
    const localStorageDate = new Date(RMPData.time)
    const now = new Date()

    const miliseconds = now - localStorageDate 
    const seconds = miliseconds / 1000
    const minutes = seconds / 60
    return minutes <= 10
}

function hardCodedDataIsMoreRecent() {
    if(!localStorage.RMPData) {
        return true
    }
    const hardCodedDataTime = hardCodedRMPData.time
    let localStorageTime = JSON.parse(localStorage.RMPData).time
    localStorageTime = new Date(localStorageTime)
    return hardCodedDataTime > localStorageTime
}


function useFetchedData(fetchedRMPData) {
    fetchedRMPData.time = new Date()
    localStorage.setItem("RMPData", JSON.stringify(fetchedRMPData))

    searchButton.addEventListener("click", function() { 
        onSearchButtonClick(fetchedRMPData) 
    });
}

function useHardCodedData() {
    searchButton.addEventListener("click", function() { 
        onSearchButtonClick(hardCodedRMPData) 
    });
}

function useLocalStorageData() {
    const localStorageData = JSON.parse(localStorage.RMPData)
    searchButton.addEventListener("click", function() { 
        onSearchButtonClick(localStorageData) 
    });
}


function main() {
    if(dataFetchedLessThanTenMinAgo()) {
        useLocalStorageData()
    } else {
        const url = ENV.isA ? 
        "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-A-RMP-profs.json"
        :
        "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-B-RMP-profs.json"

        fetch(url)
        .then((response) => response.json())
        .then((RMPData) => {
            useFetchedData(RMPData)
        })
        .catch((error) => {
            if(hardCodedDataIsMoreRecent()) {
                useHardCodedData()
            } else {
                useLocalStorageData()
            }
        })
    }
}

main()



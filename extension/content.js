/*
================================================
    Globals
================================================
*/

const hardCodedRMPData = HARD_CODED_RMP_DATA;
const courseTable = document.getElementById("results");
const searchButton = document.getElementsByName("searchbutton")[0];
const bigBodyMainstyle = document.getElementById("bigbodymainstyle");
const form = document.getElementsByTagName("form")[0];
const messageContainer = document.createElement("div");
const spinner = document.createElement("div");

/*
================================================
    UI Logic
================================================
*/

// Init custom UI on page load
bigBodyMainstyle.insertBefore(messageContainer, courseTable);

messageContainer.id = "olerate-message-container";
messageContainer.className = "sis-flash sis-flash-success";

const messageElement = document.createElement("div");
const messageTextNode = document.createTextNode(
  "Olerate is Activated! Click the 'Search' button up above to begin"
);
messageElement.id = "olerate-message-success";

messageElement.appendChild(messageTextNode);
messageContainer.appendChild(spinner);
messageContainer.appendChild(messageElement);

// UI Functions
function addSpinner() {
  spinner.className = "lds-hourglass";
}

function removeSpinner() {
  spinner.className = "";
}

const setMessageToLoading = () => {
  messageElement.innerText =
    "Loading rate my professor links ( may take up to 15 seconds )";
  messageElement.id = "olerate-message-loading";
  messageContainer.className = "sis-flash sis-flash-primary p-3";
  courseTable.style.display = "none";
};

const setMessageToSuccess = () => {
  messageContainer.className = "sis-flash sis-flash-success";
  messageElement.id = "olerate-message-success";
  messageElement.innerText =
    "Success! Click on a professor to go to their rate my professor page!";
  courseTable.style.display = "";
};

const setMessageToNothing = () => {
  messageElement.className = "";
  messageElement.innerText = "";
  messageContainer.className = "";
  courseTable.style.display = "";
};

// Change Instructor(s) to Instructor(rating)
function setInstructorLabel() {
  const instructor = document.getElementsByClassName("course--instructor")[0];
  instructor.innerText = "Instructor\n(rating)";
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
    const ProfRating = RMPProf.split(":")[1];
    const ProfId = RMPProf.split(":")[0];
    profElement.innerText = `${professor} (${ProfRating})`;
    profElement.href = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${ProfId}`;
    profElement.target = "_blank";
  } else {
    profElement.innerText = `${professor}\n(Not Found)`;
    profElement.href = "javascript:void(0)";
    profElement.style.textDecoration = "none";
    profElement.style.color = "black";
  }
};

const insertProfessorRatings = (RMPProfs) => {
  const elementsWithLinks = document.getElementsByClassName("sis-nounderline");

  const profElements = Array.from(elementsWithLinks).filter((element) => {
    return element.innerText.includes(",");
  });

  for (let i = 0; i < profElements.length; i++) {
    let professor = profElements[i].innerText;
    const RMPProf = RMPProfs[professor];
    insertProfRating(profElements[i], RMPProf, professor);
  }
};

const coursesFound = () => {
  const resultsText = courseTable.innerText;
  return !resultsText.includes("No classes found");
};

const onSearchButtonClick = (RMPData) => {
  const coursesAreLoaded = () => {
    setMessageToLoading();
    addSpinner();
    if (!searchButton.disabled) {
      removeSpinner();
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
  };

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
  if (!localStorage.RMPData) {
    return false;
  }

  const RMPData = JSON.parse(localStorage.RMPData);
  const localStorageDate = new Date(RMPData.time);
  const now = new Date();

  const miliseconds = now - localStorageDate;
  const seconds = miliseconds / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  return hours < 24;
}

function hardCodedDataIsMoreRecent() {
  if (!localStorage.RMPData) {
    return true;
  }
  const hardCodedDataTime = hardCodedRMPData.time;
  let localStorageTime = JSON.parse(localStorage.RMPData).time;
  localStorageTime = new Date(localStorageTime);
  return hardCodedDataTime > localStorageTime;
}

function useFetchedData(fetchedRMPData) {
  console.log("using fetched data");
  fetchedRMPData.time = new Date();
  localStorage.setItem("RMPData", JSON.stringify(fetchedRMPData));

  searchButton.addEventListener("click", function () {
    onSearchButtonClick(fetchedRMPData);
  });
}

function useHardCodedData() {
  console.log("using hardcoded data");
  searchButton.addEventListener("click", function () {
    onSearchButtonClick(hardCodedRMPData);
  });
}

function useLocalStorageData() {
  console.log("using local data");
  const localStorageData = JSON.parse(localStorage.RMPData);
  searchButton.addEventListener("click", function () {
    onSearchButtonClick(localStorageData);
  });
}

function main() {
  // For testing purposes
  if (ENV.useLocalData) {
    useLocalStorageData();
    return;
  } else if (ENV.useFetchedData) {
    const url = ENV.isA
      ? "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-A-RMP-profs.json"
      : "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-B-RMP-profs.json";

    fetch(url)
      .then((response) => response.json())
      .then((RMPData) => {
        useFetchedData(RMPData);
      });
    return;
  } else if (ENV.useHardCodedData) {
    useHardCodedData();
    return;
  }

  if (dataFetchedLessThanTenMinAgo()) {
    useLocalStorageData();
  } else {
    const url = ENV.isA
      ? "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-A-RMP-profs.json"
      : "https://raw.githubusercontent.com/kevin-a-nelson/AzureDevops/master/profScraper/final-B-RMP-profs.json";

    fetch(url)
      .then((response) => response.json())
      .then((RMPData) => {
        useFetchedData(RMPData);
      })
      .catch((error) => {
        if (hardCodedDataIsMoreRecent()) {
          useHardCodedData();
        } else {
          useLocalStorageData();
        }
      });
  }
}

main();

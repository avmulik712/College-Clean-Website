/* =================================
   COLLEGECLEAN - JAVASCRIPT
   ================================= */


/* ================================
   1. PAGE LOADED ANIMATION
   ================================ */

document.addEventListener("DOMContentLoaded", () => {

  document.body.classList.add("loaded");

});


/* ================================
   2. SCROLL REVEAL ANIMATION
   ================================ */

const revealElements = document.querySelectorAll(
  ".card, .f-card, .stat, .info-text"
);

const revealOnScroll = () => {

  revealElements.forEach((element) => {

    const position = element.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (position < screenHeight - 80) {
      element.classList.add("show");
    }

  });

};

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();


/* ================================
   3. ANIMATED STATISTICS
   ================================ */

const counters = document.querySelectorAll(".stat strong");

const startCounter = (counter) => {

  const target = Number(counter.textContent);

  let current = 0;

  const increment = Math.ceil(target / 40);

  const updateCounter = () => {

    current += increment;

    if (current >= target) {
      counter.textContent = target;
      return;
    }

    counter.textContent = current;

    requestAnimationFrame(updateCounter);
  };

  updateCounter();
};


const counterObserver = new IntersectionObserver(
  (entries, observer) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {

        startCounter(entry.target);

        observer.unobserve(entry.target);
      }

    });

  },
  {
    threshold: 0.5
  }
);


counters.forEach((counter) => {
  counterObserver.observe(counter);
});


/* ================================
   4. CURRENT NAVIGATION
   ================================ */

const currentPage = window.location.pathname.split("/").pop();

const navLinks = document.querySelectorAll(".navbar a");

navLinks.forEach((link) => {

  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage) {
    link.classList.add("active");
  }

});


/* ================================
   5. BUTTON CLICK EFFECT
   ================================ */

const buttons = document.querySelectorAll(
  ".main-btn, .start-btn, .r-btn, .r-his"
);

buttons.forEach((button) => {

  button.addEventListener("click", () => {

    button.classList.add("clicked");

    setTimeout(() => {
      button.classList.remove("clicked");
    }, 200);

  });

});


/* ================================
   6. SAVE LAST VISIT
   ================================ */

const lastVisit = localStorage.getItem("collegeCleanLastVisit");

if (!lastVisit) {

  console.log("Welcome to CollegeClean!");

} else {

  console.log("Welcome back to CollegeClean!");

}

localStorage.setItem(
  "collegeCleanLastVisit",
  new Date().toISOString()
);


/* ================================
   7. REPORT COUNTER
   ================================ */

let reports = Number(
  localStorage.getItem("collegeCleanReports")
) || 25;

let resolved = Number(
  localStorage.getItem("collegeCleanResolved")
) || 18;


const remaining = reports - resolved;

const statValues = document.querySelectorAll(".stat strong");

if (statValues.length >= 3) {

  statValues[0].textContent = reports;
  statValues[1].textContent = resolved;
  statValues[2].textContent = remaining;

}


/* ================================
   8. SIMPLE WELCOME MESSAGE
   ================================ */

setTimeout(() => {

  console.log(
    "🌿 CollegeClean is ready to build a cleaner campus!"
  );

}, 1000);



/* ================================
   REPORT FORM
   ================================ */

const reportForm = document.getElementById("reportForm");

if (reportForm) {

  reportForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const name = document.getElementById("reporterName").value;
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;


    const newReport = {

      id: Date.now(),

      name: name,

      category: category,

      location: location,

      description: description,

      status: "Pending",

      date: new Date().toLocaleString()

    };


    /* Get existing reports */

    const reports =
      JSON.parse(localStorage.getItem("collegeCleanReportsList")) || [];


    /* Add new report */

    reports.push(newReport);


    /* Save reports */

    localStorage.setItem(
      "collegeCleanReportsList",
      JSON.stringify(reports)
    );


    /* Update total */

    let totalReports =
      Number(localStorage.getItem("collegeCleanReports")) || 25;

    totalReports++;

    localStorage.setItem(
      "collegeCleanReports",
      totalReports
    );


    alert("🌿 Report submitted successfully!");


    reportForm.reset();

  });

}

/* ================================
   FEEDBACK FORM
   ================================ */

const feedbackForm = document.getElementById("feedbackForm");

if (feedbackForm) {

  feedbackForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const name =
      document.getElementById("feedbackName").value;

    const rating =
      document.getElementById("rating").value;

    const message =
      document.getElementById("feedbackMessage").value;


    const feedback = {

      id: Date.now(),

      name: name,

      rating: rating,

      message: message,

      date: new Date().toLocaleString()

    };


    const feedbackList =
      JSON.parse(
        localStorage.getItem("collegeCleanFeedback")
      ) || [];


    feedbackList.push(feedback);


    localStorage.setItem(
      "collegeCleanFeedback",
      JSON.stringify(feedbackList)
    );


    alert("💚 Thank you for your feedback!");


    feedbackForm.reset();

  });

}




/* ================================
   FAQ ACCORDION
   ================================ */

const faqQuestions =
  document.querySelectorAll(".faq-question");


faqQuestions.forEach((question) => {

  question.addEventListener("click", () => {

    const answer =
      question.nextElementSibling;

    const icon =
      question.querySelector("span");


    /* Close other answers */

    faqQuestions.forEach((otherQuestion) => {

      if (otherQuestion !== question) {

        const otherAnswer =
          otherQuestion.nextElementSibling;

        const otherIcon =
          otherQuestion.querySelector("span");

        otherAnswer.style.maxHeight = null;

        otherAnswer.style.paddingTop = "0";

        otherIcon.style.transform = "rotate(0deg)";
        otherIcon.textContent = "+";
      }

    });


    /* Open / close selected answer */

    if (!answer.style.maxHeight) {

      answer.style.maxHeight =
        answer.scrollHeight + "px";

      answer.style.paddingTop = "15px";

      icon.style.transform = "rotate(45deg)";

      icon.textContent = "+";

    } else {

      answer.style.maxHeight = null;

      answer.style.paddingTop = "0";

      icon.style.transform = "rotate(0deg)";

    }

  });

});


/* ================================
   DISPLAY RECENT REPORTS
   ================================ */

const reportsContainer =
  document.getElementById("reportsContainer");


if (reportsContainer) {

  const reports =
    JSON.parse(
      localStorage.getItem("collegeCleanReportsList")
    ) || [];


  if (reports.length === 0) {

    reportsContainer.innerHTML = `
      <div class="no-reports">

        <div class="no-reports-icon">
          🌿
        </div>

        <h3>No Reports Yet</h3>

        <p>
          You haven't submitted any cleanliness reports yet.
        </p>

        <a href="report.html" class="main-btn">
          REPORT AN ISSUE
        </a>

      </div>
    `;

  } else {

    /* Show newest report first */

    reports.reverse().forEach((report) => {

      const card = document.createElement("div");

      card.className = "report-card";


      card.innerHTML = `

        <div class="report-top">

          <div class="report-category">
            ${getCategoryIcon(report.category)}
            ${escapeHTML(report.category)}
          </div>

          <div class="report-status">
            ${escapeHTML(report.status)}
          </div>

        </div>


        <div class="report-info">

          <p>
            📍 <strong>Location:</strong>
            ${escapeHTML(report.location)}
          </p>

          <p>
            👤 <strong>Reported by:</strong>
            ${escapeHTML(report.name)}
          </p>

        </div>


        <div class="report-description">

          ${escapeHTML(report.description)}

        </div>


        <div class="report-date">

          🕒 Submitted:
          ${escapeHTML(report.date)}

        </div>

      `;


      reportsContainer.appendChild(card);

    });

  }

}


/* ================================
   CATEGORY ICON
   ================================ */

function getCategoryIcon(category) {

  const icons = {

    "Garbage": "🗑️",

    "Washroom": "🚻",

    "Water": "💧",

    "Classroom": "🏫",

    "Canteen": "🍴",

    "Other": "📌"

  };


  return icons[category] || "📌";

}


/* ================================
   BASIC HTML PROTECTION
   ================================ */

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


/* ================================
   CLEAR REPORT HISTORY
   ================================ */

const clearReports =
  document.getElementById("clearReports");


if (clearReports) {

  clearReports.addEventListener("click", () => {

    const confirmClear =
      confirm(
        "Are you sure you want to clear all your report history?"
      );


    if (!confirmClear) {
      return;
    }


    localStorage.removeItem(
      "collegeCleanReportsList"
    );


    location.reload();

  });

}
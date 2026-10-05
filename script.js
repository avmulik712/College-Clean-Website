```javascript
/* =================================
   COLLEGECLEAN - JAVASCRIPT
   ================================= */


/* ================================
   SUPABASE CONFIGURATION
   ================================ */

const SUPABASE_URL = "https://hsogckpvahxfyphhakgv.supabase.co";

/*
   IMPORTANT:
   Replace this with your Supabase
   Publishable/Anon Key.
   
   DO NOT use the secret/service_role key.
*/
const SUPABASE_KEY = "sb_publishable_UlWZ1m_ybYovovYjZGsbaw_XGO1zosU";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


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


if ("IntersectionObserver" in window) {

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

}


/* ================================
   4. CURRENT NAVIGATION
   ================================ */

const currentPage =
  window.location.pathname.split("/").pop();

const navLinks =
  document.querySelectorAll(".navbar a");

navLinks.forEach((link) => {

  const linkPage =
    link.getAttribute("href");

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

const lastVisit =
  localStorage.getItem("collegeCleanLastVisit");

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

/*
   Default values used for the
   homepage statistics.

   The actual submitted reports
   are stored in Supabase.
*/

let reportsCount =
  Number(localStorage.getItem("collegeCleanReports")) || 25;

let resolved =
  Number(localStorage.getItem("collegeCleanResolved")) || 18;

const remaining =
  reportsCount - resolved;

const statValues =
  document.querySelectorAll(".stat strong");

if (statValues.length >= 3) {

  statValues[0].textContent = reportsCount;
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
   9. REPORT FORM
   ================================ */

const reportForm =
  document.getElementById("reportForm");


if (reportForm) {

  reportForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      /* Get form values */

      const name =
        document
          .getElementById("reporterName")
          .value
          .trim();

      const category =
        document
          .getElementById("category")
          .value;

      const location =
        document
          .getElementById("location")
          .value
          .trim();

      const description =
        document
          .getElementById("description")
          .value
          .trim();

      const photoInput =
        document.getElementById("photo");


      /* Disable button while submitting */

      const submitButton =
        reportForm.querySelector(
          'button[type="submit"]'
        );

      if (submitButton) {

        submitButton.disabled = true;
        submitButton.textContent = "SUBMITTING...";

      }


      try {

        let photoURL = null;


        /* ================================
           UPLOAD PHOTO
           ================================ */

        if (
          photoInput &&
          photoInput.files.length > 0
        ) {

          const file =
            photoInput.files[0];


          /*
             Create a unique file name.
          */

          const fileExtension =
            file.name.includes(".")
              ? file.name.substring(
                  file.name.lastIndexOf(".")
                )
              : "";

          const fileName =
            Date.now() +
            "-" +
            Math.random()
              .toString(36)
              .substring(2, 8) +
            fileExtension;


          const {
            error: uploadError
          } =
            await supabaseClient.storage
              .from("report-photos")
              .upload(
                fileName,
                file,
                {
                  contentType: file.type,
                  upsert: false
                }
              );


          if (uploadError) {

            throw uploadError;

          }


          /*
             Get public URL of uploaded photo.
          */

          const {
            data: publicURLData
          } =
            supabaseClient.storage
              .from("report-photos")
              .getPublicUrl(fileName);


          photoURL =
            publicURLData.publicUrl;

        }


        /* ================================
           SAVE REPORT TO SUPABASE
           ================================ */

        const {
          error
        } =
          await supabaseClient
            .from("reports")
            .insert([
              {
                reporter_name: name,
                category: category,
                location: location,
                description: description,
                photo_url: photoURL
              }
            ]);


        if (error) {

          throw error;

        }


        /* ================================
           SUCCESS
           ================================ */

        alert(
          "🌿 Report submitted successfully!"
        );


        reportForm.reset();


        /*
           Go to reports page after
           successful submission.
        */

        window.location.href =
          "reports.html";


      } catch (error) {

        console.error(
          "Report submission error:",
          error
        );


        alert(
          "❌ Failed to submit report.\n\n" +
          "Please try again."
        );


        /*
           Re-enable button
        */

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "SUBMIT REPORT";

        }

      }

    }
  );

}


/* ================================
   10. FEEDBACK FORM
   ================================ */

const feedbackForm =
  document.getElementById("feedbackForm");


if (feedbackForm) {

  feedbackForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const name =
        document
          .getElementById("feedbackName")
          .value;

      const rating =
        document
          .getElementById("rating")
          .value;

      const message =
        document
          .getElementById("feedbackMessage")
          .value;


      const feedback = {

        id: Date.now(),

        name: name,

        rating: rating,

        message: message,

        date: new Date()
          .toLocaleString()

      };


      const feedbackList =
        JSON.parse(
          localStorage.getItem(
            "collegeCleanFeedback"
          )
        ) || [];


      feedbackList.push(feedback);


      localStorage.setItem(
        "collegeCleanFeedback",
        JSON.stringify(feedbackList)
      );


      alert(
        "💚 Thank you for your feedback!"
      );


      feedbackForm.reset();

    }
  );

}


/* ================================
   11. FAQ ACCORDION
   ================================ */

const faqQuestions =
  document.querySelectorAll(
    ".faq-question"
  );


faqQuestions.forEach((question) => {

  question.addEventListener(
    "click",
    () => {

      const answer =
        question.nextElementSibling;

      const icon =
        question.querySelector("span");


      /* Close other answers */

      faqQuestions.forEach(
        (otherQuestion) => {

          if (
            otherQuestion !== question
          ) {

            const otherAnswer =
              otherQuestion.nextElementSibling;

            const otherIcon =
              otherQuestion.querySelector(
                "span"
              );


            otherAnswer.style.maxHeight =
              null;

            otherAnswer.style.paddingTop =
              "0";

            otherIcon.style.transform =
              "rotate(0deg)";

            otherIcon.textContent =
              "+";

          }

        }
      );


      /* Open / close selected answer */

      if (!answer.style.maxHeight) {

        answer.style.maxHeight =
          answer.scrollHeight + "px";

        answer.style.paddingTop =
          "15px";

        icon.style.transform =
          "rotate(45deg)";

        icon.textContent =
          "+";

      } else {

        answer.style.maxHeight =
          null;

        answer.style.paddingTop =
          "0";

        icon.style.transform =
          "rotate(0deg)";

      }

    }
  );

});


/* ================================
   12. DISPLAY REPORTS FROM SUPABASE
   ================================ */

const reportsContainer =
  document.getElementById(
    "reportsContainer"
  );


if (reportsContainer) {

  loadReports();

}


async function loadReports() {

  try {

    /* Show loading message */

    reportsContainer.innerHTML = `
      <div class="no-reports">
        <p>Loading reports...</p>
      </div>
    `;


    /* Get reports from Supabase */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("reports")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      throw error;

    }


    /* No reports */

    if (!data || data.length === 0) {

      reportsContainer.innerHTML = `

        <div class="no-reports">

          <div class="no-reports-icon">
            🌿
          </div>

          <h3>No Reports Yet</h3>

          <p>
            You haven't submitted any
            cleanliness reports yet.
          </p>

          <a
            href="report.html"
            class="main-btn"
          >
            REPORT AN ISSUE
          </a>

        </div>

      `;

      return;

    }


    /* Clear container */

    reportsContainer.innerHTML = "";


    /* Display reports */

    data.forEach((report) => {

      const card =
        document.createElement("div");

      card.className =
        "report-card";


      /* Format date */

      const date =
        report.created_at
          ? new Date(
              report.created_at
            ).toLocaleString()
          : "Unknown";


      /* Create card */

      card.innerHTML = `

        <div class="report-top">

          <div class="report-category">

            ${getCategoryIcon(
              report.category
            )}

            ${escapeHTML(
              report.category
            )}

          </div>

          <div class="report-status">

            Pending

          </div>

        </div>


        <div class="report-info">

          <p>

            📍 <strong>Location:</strong>

            ${escapeHTML(
              report.location || ""
            )}

          </p>


          <p>

            👤 <strong>Reported by:</strong>

            ${escapeHTML(
              report.reporter_name || ""
            )}

          </p>

        </div>


        <div class="report-description">

          ${escapeHTML(
            report.description || ""
          )}

        </div>


        ${
          report.photo_url
            ? `
              <div class="report-image">

                <img
                  src="${escapeHTML(
                    report.photo_url
                  )}"
                  alt="Reported cleanliness issue"
                  class="report-photo"
                >

              </div>
            `
            : ""
        }


        <div class="report-date">

          🕒 Submitted:

          ${escapeHTML(date)}

        </div>

      `;


      reportsContainer.appendChild(
        card
      );

    });


  } catch (error) {

    console.error(
      "Error loading reports:",
      error
    );


    reportsContainer.innerHTML = `

      <div class="no-reports">

        <div class="no-reports-icon">
          ⚠️
        </div>

        <h3>
          Unable to Load Reports
        </h3>

        <p>
          Please check your internet
          connection and try again.
        </p>

      </div>

    `;

  }

}


/* ================================
   13. CATEGORY ICON
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


  return (
    icons[category] || "📌"
  );

}


/* ================================
   14. BASIC HTML PROTECTION
   ================================ */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text);

  return div.innerHTML;

}


/* ================================
   15. CLEAR REPORT HISTORY
   ================================ */

/*
   IMPORTANT:
   The old localStorage delete code
   has been removed.

   We should NOT allow anonymous
   visitors to delete all reports
   from Supabase.

   The existing button is therefore
   disabled for now.
*/

const clearReports =
  document.getElementById(
    "clearReports"
  );


if (clearReports) {

  clearReports.addEventListener(
    "click",
    () => {

      alert(
        "Report history cannot be cleared from the public website."
      );

    }
  );

}
```


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
  document.getElementById("reportsContainer");

if (reportsContainer) {
  loadReports();
}

async function loadReports() {

  try {

    /* Show loading message */

    reportsContainer.replaceChildren();

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading reports...";
    reportsContainer.appendChild(loadingMessage);


    /* Check Supabase connection */

    if (!supabaseClient) {
      throw new Error("Supabase client is not initialized.");
    }


    /* Get reports from Supabase */

    const { data, error } = await supabaseClient
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }


    /* Clear loading message */

    reportsContainer.replaceChildren();


    /* Show empty state */

    if (!data || data.length === 0) {

      const emptyBox = document.createElement("div");
      emptyBox.className = "no-reports";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "no-reports-icon";
      emptyIcon.textContent = "🌿";

      const heading = document.createElement("h3");
      heading.textContent = "No Reports Yet";

      const message = document.createElement("p");
      message.textContent =
        "You haven't submitted any cleanliness reports yet.";

      const link = document.createElement("a");
      link.href = "report.html";
      link.className = "main-btn";
      link.textContent = "REPORT AN ISSUE";

      emptyBox.append(
        emptyIcon,
        heading,
        message,
        link
      );

      reportsContainer.appendChild(emptyBox);
      return;

    }


    /* Display reports */

    data.forEach((report) => {

      const card = document.createElement("div");
      card.className = "report-card";


      /* Report header */

      const top = document.createElement("div");
      top.className = "report-top";

      const categoryBox = document.createElement("div");
      categoryBox.className = "report-category";

      categoryBox.textContent =
        getCategoryIcon(report.category) +
        " " +
        (report.category || "Other");

      const statusBox = document.createElement("div");
      statusBox.className = "report-status";

      statusBox.textContent =
        String(report.status || "Pending")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());

      top.append(categoryBox, statusBox);


      /* Report information */

      const info = document.createElement("div");
      info.className = "report-info";

      const locationLine = document.createElement("p");
      locationLine.textContent =
        "📍 Location: " +
        (report.location || "Not provided");

      const reporterLine = document.createElement("p");
      reporterLine.textContent =
        "👤 Reported by: " +
        (report.reporter_name || "Anonymous");

      info.append(locationLine, reporterLine);


      /* Report description */

      const description = document.createElement("div");
      description.className = "report-description";

      description.textContent =
        report.description || "No description provided.";


      /* Submitted date */

      const dateBox = document.createElement("div");
      dateBox.className = "report-date";

      let formattedDate = "Unknown";

      if (report.created_at) {

        const date = new Date(report.created_at);

        if (!Number.isNaN(date.getTime())) {
          formattedDate = date.toLocaleString();
        }

      }

      dateBox.textContent =
        "🕒 Submitted: " + formattedDate;


      /* Add report content */

      card.append(top, info, description);


      /* Display photo if available */

      if (report.photo_url) {

        try {

          const photoURL = new URL(report.photo_url);

          if (
            photoURL.protocol === "https:" ||
            photoURL.protocol === "http:"
          ) {

            const imageBox = document.createElement("div");
            imageBox.className = "report-image";

            const image = document.createElement("img");
            image.src = photoURL.href;
            image.alt = "Reported cleanliness issue";
            image.className = "report-photo";
            image.loading = "lazy";

            image.onerror = () => {
              imageBox.remove();
            };

            imageBox.appendChild(image);
            card.appendChild(imageBox);

          }

        } catch (error) {

          console.warn("Invalid report photo URL:", error);

        }

      }


      /* Add date and card to page */

      card.appendChild(dateBox);
      reportsContainer.appendChild(card);

    });


  } catch (error) {

    console.error("Error loading reports:", error);

    reportsContainer.replaceChildren();

    const errorBox = document.createElement("div");
    errorBox.className = "no-reports";

    const errorIcon = document.createElement("div");
    errorIcon.className = "no-reports-icon";
    errorIcon.textContent = "⚠️";

    const heading = document.createElement("h3");
    heading.textContent = "Unable to Load Reports";

    const message = document.createElement("p");
    message.textContent =
      "Please check your connection and try again.";

    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "main-btn";
    retryButton.textContent = "TRY AGAIN";

    retryButton.addEventListener("click", loadReports);

    errorBox.append(
      errorIcon,
      heading,
      message,
      retryButton
    );

    reportsContainer.appendChild(errorBox);

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

  return icons[category] || "📌";

}


/* ================================
   14. BASIC HTML PROTECTION
   ================================ */

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = String(text);

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
  document.getElementById("clearReports");


if (clearReports) {

  clearReports.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      alert(
        "Report history cannot be cleared from the public website."
      );

    }
  );

}

const searchRegions = document.querySelectorAll("[data-search-region]");

searchRegions.forEach((region) => {
  const form = region.querySelector("[data-search-form]");
  const input = region.querySelector("[data-search-input]");
  const scopeSelector = form ? form.getAttribute("data-search-scope") : null;
  const scope = scopeSelector ? document.querySelector(scopeSelector) : region.parentElement;
  const items = scope ? scope.querySelectorAll("[data-search-item]") : [];
  const emptyState = scope ? scope.querySelector("[data-empty-state]") : null;

  if (!form || !input || items.length === 0) {
    return;
  }

  const filterItems = () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const haystack = (item.dataset.searchItem || item.textContent).toLowerCase();
      const matches = query === "" || haystack.includes(query);
      item.hidden = !matches;

      if (matches) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    filterItems();

    const targetSelector = form.getAttribute("data-scroll-target");

    if (targetSelector) {
      const target = document.querySelector(targetSelector);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  input.addEventListener("input", filterItems);
});

const reviewStorageKey = "heritageVaultFeedback";
const feedbackForm = document.querySelector("[data-feedback-form]");
const feedbackList = document.querySelector("[data-feedback-list]");
const feedbackStatus = document.querySelector("[data-feedback-status]");

const defaultReviews = [
  {
    name: "Amina",
    service: "Digital search",
    text: "The search tools made it easy for me to locate council records for my family history project.",
    date: "12 April 2026"
  },
  {
    name: "Daniel",
    service: "Download service",
    text: "The record page was clear and the download options were easy to use for classroom research.",
    date: "8 April 2026"
  }
];

const readReviews = () => {
  try {
    const storedReviews = localStorage.getItem(reviewStorageKey);

    if (!storedReviews) {
      return defaultReviews;
    }

    const parsed = JSON.parse(storedReviews);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultReviews;
  } catch (error) {
    return defaultReviews;
  }
};

const saveReviews = (reviews) => {
  try {
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
  } catch (error) {
    if (feedbackStatus) {
      feedbackStatus.textContent = "Your browser blocked saving reviews locally, but the form is still usable.";
    }
  }
};

const renderReviews = (reviews) => {
  if (!feedbackList) {
    return;
  }

  feedbackList.innerHTML = "";

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <h4>${review.name}</h4>
      <p class="review-meta">${review.service} - ${review.date}</p>
      <p>${review.text}</p>
    `;
    feedbackList.appendChild(card);
  });
};

if (feedbackForm && feedbackList) {
  const currentReviews = readReviews();
  renderReviews(currentReviews);

  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(feedbackForm);
    const name = String(formData.get("reviewerName") || "").trim();
    const service = String(formData.get("serviceArea") || "").trim();
    const text = String(formData.get("reviewText") || "").trim();

    if (!name || !service || !text) {
      if (feedbackStatus) {
        feedbackStatus.textContent = "Please complete all feedback fields before submitting.";
      }
      return;
    }

    const updatedReviews = [
      {
        name,
        service,
        text,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      },
      ...readReviews()
    ];

    saveReviews(updatedReviews);
    renderReviews(updatedReviews);
    feedbackForm.reset();

    if (feedbackStatus) {
      feedbackStatus.textContent = "Thank you. Your review has been added to the feedback section.";
    }
  });
}

const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      if (loginStatus) {
        loginStatus.textContent = "Enter your email address to continue.";
      }
      return;
    }

    try {
      localStorage.setItem("heritageVaultUser", email);
    } catch (error) {
      // Ignore local storage errors and continue with the demo flow.
    }

    if (loginStatus) {
      loginStatus.textContent = `Welcome back. Redirecting ${email} to the archive home.`;
    }

    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
}

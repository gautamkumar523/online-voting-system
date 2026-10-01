/* ==============================================================
   CampusVote — Vestor College of Management Online Voting Portal
   js/script.js
   --------------------------------------------------------------
   Universal multi-page controller for:
     - index.html       (Election Hub / Home)
     - candidates.html  (Candidate Directory & Manifestos)
     - vote.html        (Official Voting Booth & Ballot)
     - results.html     (Live Results & Analytics Dashboard)
   ============================================================== */

"use strict";

/* ---------------------------------------------------------------
   1. CERTIFIED CANDIDATE DATA
--------------------------------------------------------------- */
const CANDIDATES = [
  {
    id: "VCM-C1",
    slug: "dipanshu-singh",
    name: "Dipanshu Singh",
    organization: "Discipline Incharge",
    tagline: "Safer campus, stronger student voice.",
    bio: "A final-year BCA student who has served two years on the Discipline Incharge council, focused on improving communication between students and administration.",
    priorities: [
      "Weekly open-forum meetings with student representatives",
      "Faster resolution of college and canteen complaints",
      "A transparent, published budget for the student council"
    ],
    manifesto: "\u201cEvery student deserves to be heard, not just once a year at elections.\u201d",
    image: "assets/images/candidates/Dipanshu.jpeg"
  },
  {
    id: "VCM-C2",
    slug: "shishir-kumar",
    name: "Shishir Kumar",
    organization: "Campus Unity Party",
    tagline: "Better labs, better placements.",
    bio: "A final-year PhD student who has spent several years working closely with students and faculty, focused on improving research support and academic opportunities across campus.",
    priorities: [
      "More research resources and better access to academic facilities",
      "Regular student\u2013faculty research discussion forums",
      "Stronger mentorship and collaboration opportunities for research scholars"
    ],
    manifesto: "\u201cBetter research opportunities today can build a stronger campus tomorrow.\u201d",
    image: "assets/images/candidates/sir.jpeg"
  },
  {
    id: "VCM-C3",
    slug: "sakshi-kumari",
    name: "Sakshi Kumari",
    organization: "College Captain",
    tagline: "A cleaner, greener college.",
    bio: "A final-year MBA student with experience organizing student activities and working with campus groups, focused on improving career opportunities, industry exposure, and student engagement.",
    priorities: [
      "More industry-expert sessions and career workshops",
      "Better internship and placement support",
      "Practical business and leadership programs for students"
    ],
    manifesto: "\u201cLet\u2019s turn campus learning into real-world opportunities.\u201d",
    image: "assets/images/candidates/sakshi.jpeg"
  },
  {
    id: "VCM-C4",
    slug: "aarav-verma",
    name: "Aarav Verma",
    organization: "Independent",
    tagline: "No banners, just better events.",
    bio: "A cultural committee volunteer running independently, focused purely on making campus events more inclusive and better funded.",
    priorities: [
      "A bigger, ring-fenced budget for cultural fests",
      "More sports and e-sports tournaments",
      "Open sign-ups for every student club, no gatekeeping"
    ],
    manifesto: "\u201cCollege life is more than lectures \u2014 let\u2019s fund the fun properly.\u201d",
    image: "assets/images/candidates/candidate-4.svg"
  }
];


/* ---------------------------------------------------------------
   2. LOCALSTORAGE KEYS & HELPERS
--------------------------------------------------------------- */
const STORAGE_VOTES = "campusvote_votes";
const STORAGE_VOTER_RECORDS = "campusvote_voter_records";
const STORAGE_REGISTRATION = "campusvote_registration";

function readStorageObject(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Could not read localStorage key:", key, error);
    return fallback;
  }
}

function writeStorageObject(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not write to localStorage:", key, error);
  }
}

function getVotes() { return readStorageObject(STORAGE_VOTES, {}); }
function getVoterRecords() { return readStorageObject(STORAGE_VOTER_RECORDS, {}); }


/* ---------------------------------------------------------------
   3. APPLICATION STATE
--------------------------------------------------------------- */
const state = {
  currentVoter: null,
  registrationComplete: false,
  voterAlreadyVoted: false,
  selectedCandidateId: null,
  voteJustSubmitted: false,
  detailsCandidateId: null,
  partyFilter: "all"
};


/* ---------------------------------------------------------------
   4. DOM ELEMENT REFERENCES (Safe on all pages)
--------------------------------------------------------------- */
const el = {
  navToggle: document.getElementById("navToggle"),
  primaryNav: document.getElementById("primaryNav"),

  infoCandidateCount: document.getElementById("infoCandidateCount"),

  registerForm: document.getElementById("registerForm"),
  regState: document.getElementById("regState"),
  regStateText: document.getElementById("regStateText"),

  candidateGrid: document.getElementById("candidateGrid"),
  candidateSearch: document.getElementById("candidateSearch"),
  candidatesEmpty: document.getElementById("candidatesEmpty"),

  voteBar: document.getElementById("voteBar"),
  voteBarImg: document.getElementById("voteBarImg"),
  voteBarName: document.getElementById("voteBarName"),
  voteNowBtn: document.getElementById("voteNowBtn"),

  statusCard: document.getElementById("statusCard"),
  statusTitle: document.getElementById("statusTitle"),
  statusMessage: document.getElementById("statusMessage"),
  viewReceiptBtn: document.getElementById("viewReceiptBtn"),

  resultsList: document.getElementById("resultsList"),
  resultsEmpty: document.getElementById("resultsEmpty"),
  totalVotes: document.getElementById("totalVotes"),
  exportResultsBtn: document.getElementById("exportResultsBtn"),
  printResultsBtn: document.getElementById("printResultsBtn"),

  demoResetBtn: document.getElementById("demoResetBtn"),

  // Vote confirmation modal
  modalOverlay: document.getElementById("modalOverlay"),
  modalClose: document.getElementById("modalClose"),
  modalCancel: document.getElementById("modalCancel"),
  modalConfirm: document.getElementById("modalConfirm"),
  modalCandidateImg: document.getElementById("modalCandidateImg"),
  modalCandidateName: document.getElementById("modalCandidateName"),
  modalCandidateParty: document.getElementById("modalCandidateParty"),

  // Candidate details modal
  detailsModalOverlay: document.getElementById("detailsModalOverlay"),
  detailsModalClose: document.getElementById("detailsModalClose"),
  detailsImg: document.getElementById("detailsImg"),
  detailsId: document.getElementById("detailsId"),
  detailsModalTitle: document.getElementById("detailsModalTitle"),
  detailsOrg: document.getElementById("detailsOrg"),
  detailsBio: document.getElementById("detailsBio"),
  detailsPriorities: document.getElementById("detailsPriorities"),
  detailsManifesto: document.getElementById("detailsManifesto"),
  detailsSelectBtn: document.getElementById("detailsSelectBtn"),

  // Ballot receipt modal
  receiptModalOverlay: document.getElementById("receiptModalOverlay"),
  receiptModalClose: document.getElementById("receiptModalClose"),
  receiptCloseBtn: document.getElementById("receiptCloseBtn"),
  receiptPrintBtn: document.getElementById("receiptPrintBtn"),
  receiptToken: document.getElementById("receiptToken"),
  receiptVoterName: document.getElementById("receiptVoterName"),
  receiptVoterId: document.getElementById("receiptVoterId"),
  receiptCandidateName: document.getElementById("receiptCandidateName"),
  receiptCandidateParty: document.getElementById("receiptCandidateParty"),
  receiptTimestamp: document.getElementById("receiptTimestamp"),

  toastContainer: document.getElementById("toastContainer")
};

/** Escapes special HTML characters to prevent XSS. */
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Generates a verifiable ballot confirmation token. */
function generateReceiptToken(voterId) {
  const seed = String(voterId || "VOTER") + Date.now().toString(36);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return "VCM-2026-" + hex.slice(0, 4) + "-" + hex.slice(4);
}

/**
 * Triggers isolated printing for either the official results or the ballot receipt.
 * Adds scoped body class so only the requested content is rendered in print mode.
 */
function triggerPrint(mode) {
  document.body.classList.remove("is-printing-results", "is-printing-receipt");
  document.body.classList.add(mode === "receipt" ? "is-printing-receipt" : "is-printing-results");

  function cleanup() {
    document.body.classList.remove("is-printing-results", "is-printing-receipt");
    window.removeEventListener("afterprint", cleanup);
  }

  window.addEventListener("afterprint", cleanup);

  window.setTimeout(function () {
    window.print();
    window.setTimeout(cleanup, 1200);
  }, 60);
}


/* ---------------------------------------------------------------
   5. RENDERING FUNCTIONS
--------------------------------------------------------------- */

function findCandidate(candidateId) {
  return CANDIDATES.find(function (c) { return c.id === candidateId; });
}

/**
 * Renders candidate cards into el.candidateGrid based on search query,
 * selected party filter, and current page context.
 */
function renderCandidates(filterText, partyFilter) {
  if (!el.candidateGrid) return;

  const query = (filterText !== undefined ? filterText : (el.candidateSearch ? el.candidateSearch.value : "")).trim().toLowerCase();
  const party = (partyFilter || state.partyFilter || "all").toLowerCase();
  const pageMode = document.body.dataset.page || "vote";

  const visibleCandidates = CANDIDATES.filter(function (candidate) {
    const matchesQuery =
      candidate.name.toLowerCase().includes(query) ||
      candidate.organization.toLowerCase().includes(query) ||
      candidate.tagline.toLowerCase().includes(query);
    const matchesParty = party === "all" || candidate.organization.toLowerCase().includes(party);
    return matchesQuery && matchesParty;
  });

  el.candidateGrid.innerHTML = "";
  if (el.candidatesEmpty) {
    el.candidatesEmpty.hidden = visibleCandidates.length !== 0;
  }

  visibleCandidates.forEach(function (candidate) {
    const isSelected = candidate.id === state.selectedCandidateId;

    const card = document.createElement("article");
    card.className = "candidate-card" + (pageMode === "candidates" ? " candidate-card--full" : "");
    card.setAttribute("role", "listitem");
    card.dataset.candidateId = candidate.id;
    card.dataset.selected = isSelected ? "true" : "false";

    let actionsHtml = "";
    if (pageMode === "candidates") {
      actionsHtml =
        '<a href="vote.html?candidate=' + encodeURIComponent(candidate.id) + '" class="btn btn--primary btn--sm">' +
          'Vote for Candidate' +
        '</a>' +
        '<button type="button" class="details-btn" data-details="' + escapeHTML(candidate.id) + '">View Manifesto</button>';
    } else if (pageMode === "home") {
      actionsHtml =
        '<a href="vote.html?candidate=' + encodeURIComponent(candidate.id) + '" class="btn btn--primary btn--sm">' +
          'Vote for Candidate' +
        '</a>' +
        '<button type="button" class="details-btn" data-details="' + escapeHTML(candidate.id) + '">Full Profile</button>';
    } else {
      // Voting booth mode
      actionsHtml =
        '<button type="button" class="select-btn" data-select="' + escapeHTML(candidate.id) + '">' +
          (isSelected ? "Selected" : "Select candidate") +
        '</button>' +
        '<button type="button" class="details-btn" data-details="' + escapeHTML(candidate.id) + '">View details</button>';
    }

    let extraDirectoryContent = "";
    if (pageMode === "candidates") {
      extraDirectoryContent =
        '<div class="candidate-card__priorities">' +
          '<strong>Key Priorities:</strong>' +
          '<ul>' + candidate.priorities.map(function (p) { return '<li>' + escapeHTML(p) + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<blockquote class="candidate-card__quote">' + escapeHTML(candidate.manifesto) + '</blockquote>';
    }

    card.innerHTML =
      '<div class="candidate-card__photo-wrap">' +
        '<img class="candidate-card__photo" src="' + encodeURI(candidate.image) + '" alt="Portrait of ' + escapeHTML(candidate.name) + '" />' +
        '<span class="candidate-card__check" aria-hidden="true">&#10003;</span>' +
      '</div>' +
      '<div class="candidate-card__body">' +
        '<span class="candidate-card__id">' + escapeHTML(candidate.id) + '</span>' +
        '<span class="candidate-card__org">' + escapeHTML(candidate.organization) + '</span>' +
        '<h3 class="candidate-card__name">' + escapeHTML(candidate.name) + '</h3>' +
        '<p class="candidate-card__tagline">' + escapeHTML(candidate.tagline) + '</p>' +
        extraDirectoryContent +
        '<div class="candidate-card__actions">' +
          actionsHtml +
        '</div>' +
      '</div>';

    el.candidateGrid.appendChild(card);
  });
}

/**
 * Updates the sticky "vote bar" at the bottom of the screen.
 */
function renderVoteBar() {
  if (!el.voteBar) return;

  if (!state.selectedCandidateId || state.voterAlreadyVoted) {
    el.voteBar.hidden = true;
    return;
  }
  const candidate = findCandidate(state.selectedCandidateId);
  if (!candidate) return;

  el.voteBar.hidden = false;
  if (el.voteBarImg) {
    el.voteBarImg.src = candidate.image;
    el.voteBarImg.alt = candidate.name;
  }
  if (el.voteBarName) el.voteBarName.textContent = candidate.name;
}

/**
 * Updates the "My status" card based on voter state machine:
 * NOT REGISTERED -> REGISTERED -> CANDIDATE SELECTED -> VOTE SUBMITTED
 */
function renderStatusCard() {
  if (!el.statusCard) return;

  if (!state.registrationComplete) {
    el.statusCard.dataset.state = "not-registered";
    if (el.statusTitle) el.statusTitle.textContent = "Not registered";
    if (el.statusMessage) el.statusMessage.textContent = "Complete voter verification above to unlock your ballot.";
    if (el.viewReceiptBtn) el.viewReceiptBtn.style.display = "none";
    return;
  }

  if (state.voterAlreadyVoted) {
    el.statusCard.dataset.state = state.voteJustSubmitted ? "submitted" : "already-voted";
    if (el.statusTitle) {
      el.statusTitle.textContent = state.voteJustSubmitted ? "Vote submitted" : "You have already voted";
    }
    if (el.statusMessage) {
      el.statusMessage.textContent = state.voteJustSubmitted
        ? "Thank you, " + state.currentVoter.fullName + ". Your official ballot has been recorded and locked."
        : "Voter ID " + state.currentVoter.voterId + " has already submitted a ballot. Only one vote is permitted per voter.";
    }
    if (el.viewReceiptBtn) el.viewReceiptBtn.style.display = "inline-flex";
    return;
  }

  if (el.viewReceiptBtn) el.viewReceiptBtn.style.display = "none";

  if (state.selectedCandidateId) {
    el.statusCard.dataset.state = "selected";
    if (el.statusTitle) el.statusTitle.textContent = "Candidate selected";
    const candidate = findCandidate(state.selectedCandidateId);
    if (el.statusMessage) {
      el.statusMessage.textContent = "You have selected " + (candidate ? candidate.name : "") + ". Click \u201cVote now\u201d below to confirm your ballot.";
    }
    return;
  }

  el.statusCard.dataset.state = "registered";
  if (el.statusTitle) el.statusTitle.textContent = "Verified \u2014 ready to vote";
  if (el.statusMessage) {
    el.statusMessage.textContent = "Welcome, " + state.currentVoter.fullName + ". Select a candidate on the ballot, then submit.";
  }
}

/**
 * Renders the live results dashboard and summary statistics.
 */
function renderResults() {
  const votes = getVotes();

  const totalVotes = CANDIDATES.reduce(function (sum, candidate) {
    return sum + (votes[candidate.id] || 0);
  }, 0);

  if (el.totalVotes) el.totalVotes.textContent = totalVotes;
  if (el.resultsEmpty) el.resultsEmpty.hidden = totalVotes > 0;

  // Sort candidates by vote count, highest first
  const ranked = CANDIDATES.slice().sort(function (a, b) {
    return (votes[b.id] || 0) - (votes[a.id] || 0);
  });

  const leaderHasVotes = totalVotes > 0;
  const leaderId = leaderHasVotes ? ranked[0].id : null;

  // Additional stats boxes if on results.html
  const statLeadingCandidate = document.getElementById("statLeadingCandidate");
  const statMargin = document.getElementById("statMargin");
  const statTurnout = document.getElementById("statTurnout");
  const statPollStatus = document.getElementById("statPollStatus");

  if (statLeadingCandidate) {
    statLeadingCandidate.textContent = (leaderId && ranked[0]) ? ranked[0].name : "No votes yet";
  }
  if (statMargin) {
    const margin = (ranked.length > 1 && totalVotes > 0)
      ? ((votes[ranked[0].id] || 0) - (votes[ranked[1].id] || 0))
      : 0;
    statMargin.textContent = totalVotes > 0 ? (margin + " vote" + (margin === 1 ? "" : "s")) : "—";
  }
  if (statTurnout) {
    const estRoll = 500;
    const turnoutPct = ((totalVotes / estRoll) * 100).toFixed(1);
    statTurnout.textContent = turnoutPct + "%";
  }
  if (statPollStatus) {
    statPollStatus.textContent = "Polls Open";
  }

  if (!el.resultsList) return;
  el.resultsList.innerHTML = "";

  ranked.forEach(function (candidate, index) {
    const count = votes[candidate.id] || 0;
    const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    const isLeader = candidate.id === leaderId && count > 0;

    const row = document.createElement("div");
    row.className = "result-row";
    row.setAttribute("role", "listitem");
    row.dataset.leader = isLeader ? "true" : "false";

    row.innerHTML =
      '<div class="result-row__top">' +
        '<div class="result-row__who">' +
          '<span class="result-row__rank">#' + (index + 1) + '</span>' +
          '<img class="result-row__thumb" src="' + encodeURI(candidate.image) + '" alt="" />' +
          '<div>' +
            '<p class="result-row__name">' + escapeHTML(candidate.name) +
              (isLeader ? ' <span class="result-row__crown">Leading</span>' : '') +
            '</p>' +
            '<p class="result-row__org">' + escapeHTML(candidate.organization) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="result-row__figures">' +
          '<span class="result-row__pct">' + percent.toFixed(1) + '%</span>' +
          '<span class="result-row__count">(' + count + ' votes)</span>' +
        '</div>' +
      '</div>' +
      '<div class="result-row__bar-track">' +
        '<div class="result-row__bar-fill" data-target-width="' + percent + '"></div>' +
      '</div>';

    el.resultsList.appendChild(row);
  });

  window.setTimeout(function () {
    document.querySelectorAll(".result-row__bar-fill").forEach(function (bar) {
      bar.style.width = bar.dataset.targetWidth + "%";
    });
  }, 50);
}

/** Fills in the small "Election information" cards. */
function renderElectionInfo() {
  if (el.infoCandidateCount) {
    el.infoCandidateCount.textContent = CANDIDATES.length + " candidates";
  }
}

function renderAll(candidateSearchValue) {
  renderCandidates(candidateSearchValue);
  renderVoteBar();
  renderStatusCard();
  renderResults();
  renderElectionInfo();
}


/* ---------------------------------------------------------------
   6. FORM VALIDATION
--------------------------------------------------------------- */
function validateFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 3) return "Full name must be at least 3 characters.";
  if (!/^[A-Za-z\s.'-]+$/.test(trimmed)) return "Full name can only contain letters and spaces.";
  return "";
}

function validateVoterId(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Voter ID is required.";
  if (!/^VCM-2026-\d{4}$/i.test(trimmed)) return "Use the format VCM-2026-#### (four digits).";
  return "";
}

function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
  return "";
}

function validateMobile(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Mobile number is required.";
  if (!/^\d{10}$/.test(trimmed)) return "Enter a valid 10-digit mobile number.";
  return "";
}

const MINIMUM_VOTING_AGE = 18;
function validateAge(value) {
  if (value === "" || value === null) return "Age is required.";
  const age = Number(value);
  if (!Number.isInteger(age)) return "Age must be a whole number.";
  if (age < MINIMUM_VOTING_AGE) return "You must be at least " + MINIMUM_VOTING_AGE + " to vote.";
  if (age > 120) return "Enter a realistic age.";
  return "";
}

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById("err-" + fieldId);
  if (!input || !errorEl) return;

  if (message) {
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
  } else {
    input.removeAttribute("aria-invalid");
    errorEl.textContent = "";
  }
}


/* ---------------------------------------------------------------
   7. EVENT LISTENERS
--------------------------------------------------------------- */

/* --- 7a. Mobile navigation toggle --- */
if (el.navToggle && el.primaryNav) {
  el.navToggle.addEventListener("click", function () {
    const isOpen = el.primaryNav.classList.toggle("is-open");
    el.navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  el.primaryNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      el.primaryNav.classList.remove("is-open");
      el.navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* --- 7b. Voter verification & registration form --- */
if (el.registerForm) {
  el.registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullNameInput = document.getElementById("fullName");
    const voterIdInput = document.getElementById("voterId");
    const emailInput = document.getElementById("email");
    const mobileInput = document.getElementById("mobile");
    const ageInput = document.getElementById("age");

    const fullName = fullNameInput ? fullNameInput.value : "";
    const voterId = voterIdInput ? voterIdInput.value.trim().toUpperCase() : "";
    const email = emailInput ? emailInput.value : "";
    const mobile = mobileInput ? mobileInput.value : "";
    const age = ageInput ? ageInput.value : "";

    const errors = {
      fullName: validateFullName(fullName),
      voterId: validateVoterId(voterId),
      email: validateEmail(email),
      mobile: validateMobile(mobile),
      age: validateAge(age)
    };

    Object.keys(errors).forEach(function (fieldId) {
      setFieldError(fieldId, errors[fieldId]);
    });

    const hasErrors = Object.values(errors).some(function (message) { return message !== ""; });
    if (hasErrors) {
      showToast("Please fix the highlighted fields before continuing.", "error");
      return;
    }

    const voter = { fullName: fullName.trim(), voterId: voterId, email: email.trim(), mobile: mobile.trim(), age: Number(age) };
    state.currentVoter = voter;
    state.registrationComplete = true;
    state.voteJustSubmitted = false;

    writeStorageObject(STORAGE_REGISTRATION, voter);

    const voterRecords = getVoterRecords();
    state.voterAlreadyVoted = Boolean(voterRecords[voterId]);

    if (el.regState) el.regState.dataset.state = "complete";
    if (el.regStateText) el.regStateText.textContent = "Registration complete";

    if (state.voterAlreadyVoted) {
      showToast("This voter ID has already voted in this election.", "warning");
    } else {
      showToast("Voter verification successful. Ballot unlocked.", "success");
    }

    renderAll(el.candidateSearch ? el.candidateSearch.value : "");
  });

  /* Real-time field validation & auto-uppercase for Voter ID */
  const formFieldValidators = [
    { id: "fullName", validator: validateFullName },
    { id: "voterId", validator: validateVoterId },
    { id: "email", validator: validateEmail },
    { id: "mobile", validator: validateMobile },
    { id: "age", validator: validateAge }
  ];

  formFieldValidators.forEach(function (item) {
    const input = document.getElementById(item.id);
    if (!input) return;

    if (item.id === "voterId") {
      input.addEventListener("input", function () {
        const caret = input.selectionStart;
        input.value = input.value.toUpperCase();
        input.setSelectionRange(caret, caret);
      });
    }

    input.addEventListener("blur", function () {
      const errorMsg = item.validator(input.value);
      setFieldError(item.id, errorMsg);
    });

    input.addEventListener("input", function () {
      const errorEl = document.getElementById("err-" + item.id);
      if (errorEl && errorEl.textContent) {
        const errorMsg = item.validator(input.value);
        setFieldError(item.id, errorMsg);
      }
    });
  });
}

/* --- 7c. Candidate search --- */
if (el.candidateSearch) {
  el.candidateSearch.addEventListener("input", function () {
    renderCandidates(el.candidateSearch.value, state.partyFilter);
  });
}

/* --- 7c-2. Party filter pills (candidates.html) --- */
const filterPills = document.querySelectorAll(".filter-pill");
filterPills.forEach(function (pill) {
  pill.addEventListener("click", function () {
    filterPills.forEach(function (p) { p.classList.remove("is-active"); });
    pill.classList.add("is-active");
    state.partyFilter = pill.dataset.filter || "all";
    renderCandidates(el.candidateSearch ? el.candidateSearch.value : "", state.partyFilter);
  });
});

/* --- 7d. Candidate selection & Details (event delegation) --- */
if (el.candidateGrid) {
  el.candidateGrid.addEventListener("click", function (event) {
    const selectButton = event.target.closest("[data-select]");
    if (selectButton) {
      selectCandidate(selectButton.dataset.select);
      return;
    }

    const detailsButton = event.target.closest("[data-details]");
    if (detailsButton) {
      openDetailsModal(detailsButton.dataset.details);
    }
  });
}

function selectCandidate(candidateId) {
  state.selectedCandidateId = candidateId;
  renderCandidates(el.candidateSearch ? el.candidateSearch.value : "", state.partyFilter);
  renderVoteBar();
  renderStatusCard();

  const candidate = findCandidate(candidateId);
  if (candidate) {
    showToast(candidate.name + " selected. Confirm your choice below.", "success");
  }
}

/* --- 7e. Candidate details modal --- */
function openDetailsModal(candidateId) {
  const candidate = findCandidate(candidateId);
  if (!candidate || !el.detailsModalOverlay) return;

  state.detailsCandidateId = candidateId;

  if (el.detailsImg) {
    el.detailsImg.src = candidate.image;
    el.detailsImg.alt = candidate.name;
  }
  if (el.detailsId) el.detailsId.textContent = candidate.id;
  if (el.detailsModalTitle) el.detailsModalTitle.textContent = candidate.name;
  if (el.detailsOrg) el.detailsOrg.textContent = candidate.organization;
  if (el.detailsBio) el.detailsBio.textContent = candidate.bio;
  if (el.detailsManifesto) el.detailsManifesto.textContent = candidate.manifesto;

  if (el.detailsPriorities) {
    el.detailsPriorities.innerHTML = "";
    candidate.priorities.forEach(function (priority) {
      const li = document.createElement("li");
      li.textContent = priority;
      el.detailsPriorities.appendChild(li);
    });
  }

  if (el.detailsSelectBtn) {
    const isBooth = document.body.dataset.page === "vote";
    if (isBooth) {
      el.detailsSelectBtn.textContent = candidate.id === state.selectedCandidateId ? "Selected" : "Select this candidate";
      el.detailsSelectBtn.onclick = function () {
        selectCandidate(candidate.id);
        closeDetailsModal();
      };
    } else {
      el.detailsSelectBtn.textContent = "Vote for this candidate";
      el.detailsSelectBtn.onclick = function () {
        window.location.href = "vote.html?candidate=" + encodeURIComponent(candidate.id);
      };
    }
  }

  el.detailsModalOverlay.hidden = false;
  if (el.detailsModalClose) el.detailsModalClose.focus();
}

function closeDetailsModal() {
  if (el.detailsModalOverlay) {
    el.detailsModalOverlay.hidden = true;
    state.detailsCandidateId = null;
  }
}

if (el.detailsModalClose) el.detailsModalClose.addEventListener("click", closeDetailsModal);
if (el.detailsModalOverlay) {
  el.detailsModalOverlay.addEventListener("click", function (event) {
    if (event.target === el.detailsModalOverlay) closeDetailsModal();
  });
}

/* --- 7f. "Vote now" button opens confirmation modal --- */
if (el.voteNowBtn) {
  el.voteNowBtn.addEventListener("click", function () {
    if (!state.registrationComplete) {
      showToast("Please complete voter verification first.", "error");
      const reg = document.getElementById("register");
      if (reg) reg.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (state.voterAlreadyVoted) {
      showToast("You have already voted. Only one ballot is allowed per voter.", "warning");
      return;
    }

    if (!state.selectedCandidateId) {
      showToast("Please select a candidate before voting.", "error");
      return;
    }

    openConfirmationModal();
  });
}

function openConfirmationModal() {
  const candidate = findCandidate(state.selectedCandidateId);
  if (!candidate || !el.modalOverlay) return;

  if (el.modalCandidateImg) {
    el.modalCandidateImg.src = candidate.image;
    el.modalCandidateImg.alt = candidate.name;
  }
  if (el.modalCandidateName) el.modalCandidateName.textContent = candidate.name;
  if (el.modalCandidateParty) el.modalCandidateParty.textContent = candidate.organization;

  el.modalOverlay.hidden = false;
  if (el.modalConfirm) el.modalConfirm.focus();
}

function closeConfirmationModal() {
  if (el.modalOverlay) el.modalOverlay.hidden = true;
}

if (el.modalClose) el.modalClose.addEventListener("click", closeConfirmationModal);
if (el.modalCancel) el.modalCancel.addEventListener("click", closeConfirmationModal);
if (el.modalOverlay) {
  el.modalOverlay.addEventListener("click", function (event) {
    if (event.target === el.modalOverlay) closeConfirmationModal();
  });
}

// Escape key closes open modals
document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (el.modalOverlay && !el.modalOverlay.hidden) closeConfirmationModal();
  if (el.detailsModalOverlay && !el.detailsModalOverlay.hidden) closeDetailsModal();
  if (el.receiptModalOverlay && !el.receiptModalOverlay.hidden) closeReceiptModal();
});

/* --- 7g. Final vote submission --- */
if (el.modalConfirm) {
  el.modalConfirm.addEventListener("click", function () {
    const candidateId = state.selectedCandidateId;
    const voterId = state.currentVoter ? state.currentVoter.voterId : null;

    if (!voterId) {
      closeConfirmationModal();
      showToast("Missing voter information.", "error");
      return;
    }

    const voterRecords = getVoterRecords();
    if (voterRecords[voterId]) {
      closeConfirmationModal();
      state.voterAlreadyVoted = true;
      renderStatusCard();
      showToast("This voter ID has already voted.", "warning");
      return;
    }

    const receiptToken = generateReceiptToken(voterId);
    const timestamp = new Date().toISOString();

    const votes = getVotes();
    votes[candidateId] = (votes[candidateId] || 0) + 1;
    writeStorageObject(STORAGE_VOTES, votes);

    voterRecords[voterId] = {
      candidateId: candidateId,
      name: state.currentVoter.fullName,
      token: receiptToken,
      timestamp: timestamp
    };
    writeStorageObject(STORAGE_VOTER_RECORDS, voterRecords);

    state.voterAlreadyVoted = true;
    state.voteJustSubmitted = true;
    closeConfirmationModal();

    const candidate = findCandidate(candidateId);
    showToast("Official vote recorded for " + (candidate ? candidate.name : "candidate") + ".", "success");

    renderAll(el.candidateSearch ? el.candidateSearch.value : "");

    const statusSec = document.getElementById("status");
    if (statusSec) statusSec.scrollIntoView({ behavior: "smooth" });

    window.setTimeout(function () {
      openReceiptModal(voterId);
    }, 650);
  });
}

/* --- 7h. Official ballot receipt modal --- */
function openReceiptModal(voterId) {
  const targetId = voterId || (state.currentVoter && state.currentVoter.voterId);
  if (!targetId || !el.receiptModalOverlay) return;

  const voterRecords = getVoterRecords();
  const record = voterRecords[targetId];
  if (!record) return;

  const candidate = findCandidate(record.candidateId);

  if (el.receiptToken) el.receiptToken.textContent = record.token || "VCM-2026-REC-001";
  if (el.receiptVoterName) el.receiptVoterName.textContent = record.name || (state.currentVoter && state.currentVoter.fullName) || "—";
  if (el.receiptVoterId) el.receiptVoterId.textContent = targetId;
  if (el.receiptCandidateName) el.receiptCandidateName.textContent = candidate ? candidate.name : "—";
  if (el.receiptCandidateParty) el.receiptCandidateParty.textContent = candidate ? candidate.organization : "—";
  if (el.receiptTimestamp) {
    el.receiptTimestamp.textContent = new Date(record.timestamp).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  el.receiptModalOverlay.hidden = false;
  if (el.receiptCloseBtn) el.receiptCloseBtn.focus();
}

function closeReceiptModal() {
  if (el.receiptModalOverlay) {
    el.receiptModalOverlay.hidden = true;
  }
}

if (el.viewReceiptBtn) {
  el.viewReceiptBtn.addEventListener("click", function () {
    openReceiptModal();
  });
}
if (el.receiptModalClose) el.receiptModalClose.addEventListener("click", closeReceiptModal);
if (el.receiptCloseBtn) el.receiptCloseBtn.addEventListener("click", closeReceiptModal);
if (el.receiptPrintBtn) {
  el.receiptPrintBtn.addEventListener("click", function () {
    triggerPrint("receipt");
  });
}
if (el.receiptModalOverlay) {
  el.receiptModalOverlay.addEventListener("click", function (event) {
    if (event.target === el.receiptModalOverlay) closeReceiptModal();
  });
}

/* --- 7i. Export Results as CSV --- */
if (el.exportResultsBtn) {
  el.exportResultsBtn.addEventListener("click", function () {
    const votes = getVotes();
    const totalVotes = CANDIDATES.reduce(function (sum, candidate) {
      return sum + (votes[candidate.id] || 0);
    }, 0);

    const headers = ["Candidate ID", "Candidate Name", "Organization / Party", "Vote Count", "Percentage"];
    const rows = CANDIDATES.map(function (candidate) {
      const count = votes[candidate.id] || 0;
      const pct = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) + "%" : "0.0%";
      return [
        `"${candidate.id}"`,
        `"${candidate.name.replace(/"/g, '""')}"`,
        `"${candidate.organization.replace(/"/g, '""')}"`,
        count,
        `"${pct}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Vestor_Student_Council_Election_2026_Results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Results exported to CSV successfully.", "success");
  });
}

/* --- 7j. Print Results --- */
if (el.printResultsBtn) {
  el.printResultsBtn.addEventListener("click", function () {
    triggerPrint("results");
  });
}

/* --- 7k. Demo reset tool --- */
if (el.demoResetBtn) {
  el.demoResetBtn.addEventListener("click", function () {
    const confirmed = window.confirm(
      "Reset Election Data\n\n" +
      "This will clear all registration records, votes, and candidate tallies " +
      "stored on this device. Continue?"
    );
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_VOTES);
    localStorage.removeItem(STORAGE_VOTER_RECORDS);
    localStorage.removeItem(STORAGE_REGISTRATION);

    state.currentVoter = null;
    state.registrationComplete = false;
    state.voterAlreadyVoted = false;
    state.selectedCandidateId = null;
    state.voteJustSubmitted = false;

    if (el.registerForm) el.registerForm.reset();
    ["fullName", "voterId", "email", "mobile", "age"].forEach(function (id) {
      setFieldError(id, "");
    });
    if (el.regState) el.regState.dataset.state = "incomplete";
    if (el.regStateText) el.regStateText.textContent = "Registration incomplete";

    renderAll("");
    showToast("Election data has been reset.", "success");
  });
}

/* --- 7l. Real-time cross-tab synchronization --- */
window.addEventListener("storage", function (event) {
  if (event.key === STORAGE_VOTES || event.key === STORAGE_VOTER_RECORDS) {
    if (el.resultsList) renderResults();
    if (el.statusCard && state.currentVoter) {
      const records = getVoterRecords();
      state.voterAlreadyVoted = Boolean(records[state.currentVoter.voterId]);
      renderStatusCard();
    }
  }
});


/* ---------------------------------------------------------------
   8. TOAST NOTIFICATIONS
--------------------------------------------------------------- */
function showToast(message, type) {
  if (!el.toastContainer) return;

  const toast = document.createElement("div");
  const typeClass = type === "success" ? " toast--success" : type === "error" ? " toast--error" : type === "warning" ? " toast--warning" : "";
  toast.className = "toast" + typeClass;
  toast.textContent = message;
  toast.setAttribute("role", "status");

  el.toastContainer.appendChild(toast);

  window.setTimeout(function () {
    toast.classList.add("is-leaving");
    window.setTimeout(function () { toast.remove(); }, 220);
  }, 3600);
}


/* ---------------------------------------------------------------
   9. INITIALIZATION
--------------------------------------------------------------- */
function init() {
  // 1. Restore registration from localStorage if present
  const savedVoter = readStorageObject(STORAGE_REGISTRATION, null);
  if (savedVoter && savedVoter.voterId) {
    state.currentVoter = savedVoter;
    state.registrationComplete = true;

    const voterRecords = getVoterRecords();
    state.voterAlreadyVoted = Boolean(voterRecords[savedVoter.voterId]);

    const fullNameInput = document.getElementById("fullName");
    const voterIdInput = document.getElementById("voterId");
    const emailInput = document.getElementById("email");
    const mobileInput = document.getElementById("mobile");
    const ageInput = document.getElementById("age");

    if (fullNameInput) fullNameInput.value = savedVoter.fullName || "";
    if (voterIdInput) voterIdInput.value = savedVoter.voterId || "";
    if (emailInput) emailInput.value = savedVoter.email || "";
    if (mobileInput) mobileInput.value = savedVoter.mobile || "";
    if (ageInput) ageInput.value = savedVoter.age || "";

    if (el.regState) el.regState.dataset.state = "complete";
    if (el.regStateText) el.regStateText.textContent = "Registration complete";
  }

  // 2. Read URL parameters (e.g. vote.html?candidate=VCM-C1)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCandidate = urlParams.get("candidate");
    if (preselectedCandidate && findCandidate(preselectedCandidate)) {
      state.selectedCandidateId = preselectedCandidate;
    }
  } catch (e) {
    console.warn("Could not read URL query parameters:", e);
  }

  // 3. Initial renders
  renderElectionInfo();
  renderAll("");
}

init();

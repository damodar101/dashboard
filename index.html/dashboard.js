// ==========================================
// OUR DATE DASHBOARD
// ==========================================

// Supabase
const SUPABASE_URL = "https://vvjobodhgoreukhdaayf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_dTndfgFoAfLwyfVTNcmCyQ_YZp68jMd";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// SETTINGS
// ==========================================

// Your invitation code
const INVITE_CODE = "Forever2024";

// Dashboard password
// You can change this to whatever password you want.
const DASHBOARD_PASSWORD = "Forever2024";


// ==========================================
// ELEMENTS
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const dashboardPassword = document.getElementById("dashboardPassword");
const loginError = document.getElementById("loginError");

const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");
const refreshIcon = document.getElementById("refreshIcon");

const totalChoices = document.getElementById("totalChoices");
const latestActivity = document.getElementById("latestActivity");
const latestDate = document.getElementById("latestDate");
const latestTime = document.getElementById("latestTime");

const latestStatus = document.getElementById("latestStatus");
const latestCard = document.getElementById("latestCard");

const submissionsTable = document.getElementById("submissionsTable");
const lastUpdated = document.getElementById("lastUpdated");


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const password = dashboardPassword.value.trim();

    if (password === DASHBOARD_PASSWORD) {

        sessionStorage.setItem("dateDashboardLoggedIn", "true");

        loginError.style.display = "none";

        loginScreen.classList.add("hidden");
        dashboard.classList.remove("hidden");

        loadDashboard();

    } else {

        loginError.style.display = "block";

        dashboardPassword.value = "";
        dashboardPassword.focus();
    }
});


// ==========================================
// CHECK LOGIN
// ==========================================

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem("dateDashboardLoggedIn");

    if (loggedIn === "true") {

        loginScreen.classList.add("hidden");
        dashboard.classList.remove("hidden");

        loadDashboard();

    } else {

        loginScreen.classList.remove("hidden");
        dashboard.classList.add("hidden");
    }
}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", function () {

    sessionStorage.removeItem("dateDashboardLoggedIn");

    dashboard.classList.add("hidden");
    loginScreen.classList.remove("hidden");

    dashboardPassword.value = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    setRefreshing(true);

    try {

        const { data, error } = await supabaseClient
            .from("date_responses")
            .select("*")
            .eq("invite_code", INVITE_CODE)
            .order("submitted_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        updateDashboard(data || []);

        updateLastUpdated();

    } catch (error) {

        console.error("Dashboard error:", error);

        showError(error);

    } finally {

        setRefreshing(false);
    }
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(submissions) {

    // Total
    totalChoices.textContent = submissions.length;


    // No submissions
    if (submissions.length === 0) {

        latestActivity.textContent = "—";
        latestDate.textContent = "—";
        latestTime.textContent = "—";

        latestStatus.textContent = "Waiting";

        latestCard.innerHTML = `
            <div class="latest-empty">
                <div class="empty-icon">💗</div>

                <h3>Waiting for the first choice</h3>

                <p>
                    When she submits the date,
                    it will appear here.
                </p>
            </div>
        `;

        submissionsTable.innerHTML = `
            <tr class="empty-row">
                <td colspan="5">
                    <div class="table-empty">
                        <span>💌</span>
                        <p>No date choices yet.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    // Latest submission
    const latest = submissions[0];


    latestActivity.textContent =
        latest.activity || "—";

    latestDate.textContent =
        formatDate(latest.selected_date);

    latestTime.textContent =
        latest.selected_time || "—";


    latestStatus.textContent = "Received";


    // Latest card
    latestCard.innerHTML = createLatestCard(latest);


    // History
    submissionsTable.innerHTML =
        submissions.map(function (submission, index) {

            return createTableRow(
                submission,
                index + 1
            );

        }).join("");
}


// ==========================================
// LATEST CARD
// ==========================================

function createLatestCard(submission) {

    const activity = submission.activity || "Date";

    const date =
        formatDate(submission.selected_date);

    const time =
        submission.selected_time || "Not selected";

    const submitted =
        formatSubmittedDate(submission.submitted_at);


    return `
        <div class="latest-card-content">

            <div class="latest-heart">
                ❤️
            </div>

            <div class="latest-info">

                <p class="latest-label">
                    SHE CHOSE
                </p>

                <h3>
                    ${escapeHTML(activity)}
                </h3>

                <div class="latest-details">

                    <span>
                        📅 ${escapeHTML(date)}
                    </span>

                    <span>
                        🕐 ${escapeHTML(time)}
                    </span>

                </div>

                <p class="latest-submitted">
                    ${escapeHTML(
                        submission.submission_message ||
                        "She chose this on " + submitted
                    )}
                </p>

            </div>

        </div>
    `;
}


// ==========================================
// TABLE ROW
// ==========================================

function createTableRow(submission, number) {

    const activity =
        submission.activity || "—";

    const date =
        formatDate(submission.selected_date);

    const time =
        submission.selected_time || "—";

    const submitted =
        formatSubmittedDate(submission.submitted_at);


    return `
        <tr>

            <td>
                <span class="row-number">
                    ${number}
                </span>
            </td>

            <td>
                <strong>
                    ${escapeHTML(activity)}
                </strong>
            </td>

            <td>
                ${escapeHTML(date)}
            </td>

            <td>
                ${escapeHTML(time)}
            </td>

            <td>
                ${escapeHTML(submitted)}
            </td>

        </tr>
    `;
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kathmandu"
    });
}


// ==========================================
// SUBMISSION TIME FORMAT
// ==========================================

function formatSubmittedDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kathmandu"
    });
}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener("click", function () {

    loadDashboard();
});


function setRefreshing(isRefreshing) {

    if (isRefreshing) {

        refreshButton.disabled = true;

        refreshIcon.textContent = "⟳";

        refreshIcon.style.display = "inline-block";

        refreshIcon.style.animation =
            "dashboardSpin 0.8s linear infinite";

    } else {

        refreshButton.disabled = false;

        refreshIcon.textContent = "↻";

        refreshIcon.style.animation = "none";
    }
}


// ==========================================
// LAST UPDATED
// ==========================================

function updateLastUpdated() {

    const now = new Date();

    lastUpdated.textContent =
        "Updated " +
        now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kathmandu"
        });
}


// ==========================================
// ERROR
// ==========================================

function showError(error) {

    latestStatus.textContent = "Error";

    latestCard.innerHTML = `
        <div class="latest-empty">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Could not load submissions
            </h3>

            <p>
                Please check your Supabase connection
                and try refreshing the dashboard.
            </p>

        </div>
    `;

    console.error(error);
}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// SMALL LOADING ANIMATION
// ==========================================

const style = document.createElement("style");

style.textContent = `
    @keyframes dashboardSpin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    .refresh-btn-disabled {
        opacity: 0.6;
        pointer-events: none;
    }
`;

document.head.appendChild(style);


// ==========================================
// BACKGROUND PARTICLES
// ==========================================

function createParticles() {

    const container =
        document.getElementById("particles");

    if (!container) {
        return;
    }

    const particleCount = 35;

    for (let i = 0; i < particleCount; i++) {

        const particle =
            document.createElement("span");

        particle.className = "particle";

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.top =
            Math.random() * 100 + "%";

        particle.style.animationDelay =
            Math.random() * 5 + "s";

        particle.style.animationDuration =
            4 + Math.random() * 6 + "s";

        container.appendChild(particle);
    }
}


// ==========================================
// START
// ==========================================

createParticles();

checkLogin();
// Client navigation helper
function getLoggedInClient() {
  const stored = localStorage.getItem("loggedInClient");
  return stored ? JSON.parse(stored) : null;
}

function logoutClient() {
  localStorage.removeItem("loggedInClient");
  window.location.href = "client-signin.html";
}

function renderClientNav() {
  const client = getLoggedInClient();
  const dashboardItem = document.getElementById("clientDashboardItem");
  const logoutItem = document.getElementById("clientLogoutItem");

  if (!dashboardItem || !logoutItem) {
    return;
  }

  if (client) {
    dashboardItem.innerHTML = '<a href="client-dashboard.html">Dashboard</a>';
    logoutItem.innerHTML = '<a href="#" id="clientLogoutLink">Logout</a>';
    const logoutLink = document.getElementById("clientLogoutLink");
    if (logoutLink) {
      logoutLink.addEventListener("click", function(e) {
        e.preventDefault();
        logoutClient();
      });
    }
  } else {
    dashboardItem.innerHTML = '<a href="client-signin.html">Login</a>';
    logoutItem.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", renderClientNav);

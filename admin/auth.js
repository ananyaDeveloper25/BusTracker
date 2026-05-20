// Admin credentials (hardcoded)
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123", role: "admin" };

/**
 * login(role, username, password)
 * For admin: checks hardcoded credentials.
 * For driver: looks up username + password in driverData localStorage.
 * Returns the role string on success, null on failure.
 */
function login(role, username, password) {
  if (role === "admin") {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin", username: "admin" }));
      localStorage.removeItem("loggedInDriver");
      return "admin";
    }
    return null;
  }

  if (role === "driver") {
    const drivers = JSON.parse(localStorage.getItem("driverData")) || [];
    const driver = drivers.find(d => d.username === username && d.password === password);
    if (driver) {
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "driver", username: driver.username, driverId: driver.id }));
      localStorage.setItem("loggedInDriver", JSON.stringify(driver));
      return "driver";
    }
    return null;
  }

  return null;
}

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("loggedInDriver");
  window.location.href = "../login.html";
}

// Bind logout button if present on page
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}
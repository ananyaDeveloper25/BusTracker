document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const errorEl = document.getElementById("formError");
  errorEl.textContent = "";
  errorEl.classList.remove("show");

  try {
    const role = document.querySelector('input[name="role"]:checked').value;
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username) throw new Error("Username is required.");
    if (!password) throw new Error("Password is required.");

    // login() is defined in auth.js
    const loggedRole = login(role, username, password);

    if (!loggedRole) {
      throw new Error("Invalid username or password. Please try again.");
    }

    if (loggedRole === "admin") {
      window.location.href = "admin-panel/admin.html";
    } else if (loggedRole === "driver") {
      window.location.href = "driver-panel/driver.html";
    } else {
      throw new Error("Unauthorized role.");
    }

  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.add("show");
  }
});

// Clear error on input
document.getElementById("loginUsername").addEventListener("input", () => {
  document.getElementById("formError").textContent = "";
  document.getElementById("formError").classList.remove("show");
});
document.getElementById("loginPassword").addEventListener("input", () => {
  document.getElementById("formError").textContent = "";
  document.getElementById("formError").classList.remove("show");
});
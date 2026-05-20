// Client Authentication Module
// Handles signup, signin, logout, and password change for clients

// Initialize client data storage
function initClientStorage() {
  if (!localStorage.getItem("clientData")) {
    localStorage.setItem("clientData", JSON.stringify([]));
  }
  if (!localStorage.getItem("clientBookings")) {
    localStorage.setItem("clientBookings", JSON.stringify([]));
  }
  if (!localStorage.getItem("clientComplaints")) {
    localStorage.setItem("clientComplaints", JSON.stringify([]));
  }
}

// Get all clients
function getClients() {
  return JSON.parse(localStorage.getItem("clientData")) || [];
}

// Save clients
function saveClients(clients) {
  localStorage.setItem("clientData", JSON.stringify(clients));
}

// Get current logged in client
function getCurrentClient() {
  const client = localStorage.getItem("loggedInClient");
  return client ? JSON.parse(client) : null;
}

// Sign up new client
function signupClient(clientData) {
  initClientStorage();
  const clients = getClients();
  
  // Check if email already exists
  const existingClient = clients.find(c => c.email.toLowerCase() === clientData.email.toLowerCase());
  if (existingClient) {
    return { success: false, message: "Email already registered" };
  }
  
  // Check if roll number already exists
  const existingRoll = clients.find(c => c.rollNumber === clientData.rollNumber);
  if (existingRoll) {
    return { success: false, message: "Roll number already registered" };
  }
  
  // Create new client with ID
  const newClient = {
    id: Date.now(),
    ...clientData,
    createdAt: new Date().toISOString()
  };
  
  clients.push(newClient);
  saveClients(clients);
  
  // Auto login after signup
  localStorage.setItem("loggedInClient", JSON.stringify(newClient));
  
  return { success: true, message: "Account created successfully", client: newClient };
}

// Sign in client
function signinClient(email, password) {
  initClientStorage();
  const clients = getClients();
  
  const client = clients.find(c => 
    c.email.toLowerCase() === email.toLowerCase() && c.password === password
  );
  
  if (client) {
    localStorage.setItem("loggedInClient", JSON.stringify(client));
    return { success: true, message: "Signed in successfully", client: client };
  }
  
  return { success: false, message: "Invalid email or password" };
}

// Logout client
function logoutClient() {
  localStorage.removeItem("loggedInClient");
  window.location.href = "client-signin.html";
}

// Change password
function changePassword(clientId, oldPassword, newPassword) {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1) {
    return { success: false, message: "Client not found" };
  }
  
  if (clients[clientIndex].password !== oldPassword) {
    return { success: false, message: "Current password is incorrect" };
  }
  
  clients[clientIndex].password = newPassword;
  saveClients(clients);
  
  // Update logged in client
  const updatedClient = clients[clientIndex];
  localStorage.setItem("loggedInClient", JSON.stringify(updatedClient));
  
  return { success: true, message: "Password changed successfully" };
}

// Get client bookings
function getClientBookings(clientId) {
  const allBookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  return allBookings.filter(b => b.clientId === clientId);
}

// Save client booking
function saveClientBooking(booking) {
  const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  bookings.push({
    id: Date.now(),
    ...booking,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem("clientBookings", JSON.stringify(bookings));
}

// Get client complaints
function getClientComplaints(clientId) {
  const allComplaints = JSON.parse(localStorage.getItem("complaintData")) || [];
  return allComplaints.filter(c => c.clientId === clientId);
}

// Check if client is logged in
function requireClientAuth() {
  const client = getCurrentClient();
  if (!client) {
    window.location.href = "client-signin.html";
    return false;
  }
  return client;
}

// Handle signup form submission
document.addEventListener("DOMContentLoaded", function() {
  // Show/hide 'Other' input for degree
  const degreeSelect = document.getElementById("degreeName");
  const degreeOther = document.getElementById("degreeOther");
  degreeSelect.addEventListener("change", function() {
    if (degreeSelect.value === "Other") {
      degreeOther.style.display = "block";
      degreeOther.required = true;
    } else {
      degreeOther.style.display = "none";
      degreeOther.required = false;
      degreeOther.value = "";
    }
  });

  // Show/hide 'Other' input for specialization
  const specializationSelect = document.getElementById("specialization");
  const specializationOther = document.getElementById("specializationOther");
  specializationSelect.addEventListener("change", function() {
    if (specializationSelect.value === "Other") {
      specializationOther.style.display = "block";
      specializationOther.required = true;
    } else {
      specializationOther.style.display = "none";
      specializationOther.required = false;
      specializationOther.value = "";
    }
  });

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const formError = document.getElementById("formError");
      formError.textContent = "";
      formError.className = "form-error";

      // Validate all fields
      const requiredFields = [
        "fullName", "email", "password", "confirmPassword", "rollNumber", "contact", "degreeName", "specialization", "yearStart", "yearEnd"
      ];
      let hasError = false;
      requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (el && (!el.value || el.value.trim() === "")) {
          hasError = true;
          el.classList.add("input-error");
        } else if (el) {
          el.classList.remove("input-error");
        }
      });
      // Check 'Other' fields
      if (degreeSelect.value === "Other" && (!degreeOther.value || degreeOther.value.trim() === "")) {
        hasError = true;
        degreeOther.classList.add("input-error");
      } else {
        degreeOther.classList.remove("input-error");
      }
      if (specializationSelect.value === "Other" && (!specializationOther.value || specializationOther.value.trim() === "")) {
        hasError = true;
        specializationOther.classList.add("input-error");
      } else {
        specializationOther.classList.remove("input-error");
      }

      // Password match
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      if (password !== confirmPassword) {
        formError.textContent = "Passwords do not match";
        formError.className = "form-error show";
        document.getElementById("password").classList.add("input-error");
        document.getElementById("confirmPassword").classList.add("input-error");
        return;
      } else {
        document.getElementById("password").classList.remove("input-error");
        document.getElementById("confirmPassword").classList.remove("input-error");
      }

      if (password.length < 6) {
        formError.textContent = "Password must be at least 6 characters";
        formError.className = "form-error show";
        document.getElementById("password").classList.add("input-error");
        return;
      }

      if (hasError) {
        formError.textContent = "Please fill all required fields.";
        formError.className = "form-error show";
        return;
      }

      const clientData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        password: password,
        rollNumber: document.getElementById("rollNumber").value,
        contact: document.getElementById("contact").value,
        degreeName: degreeSelect.value === "Other" ? degreeOther.value : degreeSelect.value,
        specialization: specializationSelect.value === "Other" ? specializationOther.value : specializationSelect.value,
        address: document.getElementById("address") ? document.getElementById("address").value : "",
        yearStart: document.getElementById("yearStart").value,
        yearEnd: document.getElementById("yearEnd").value
      };

      const result = signupClient(clientData);

      if (result.success) {
        alert("Account created successfully!");
        window.location.href = "client-dashboard.html";
      } else {
        formError.textContent = result.message;
        formError.className = "form-error show";
      }
    });
  }
});

// Handle signin form submission
document.addEventListener("DOMContentLoaded", function() {
  const signinForm = document.getElementById("signinForm");
  if (signinForm) {
    signinForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const formError = document.getElementById("formError");
      formError.textContent = "";
      formError.className = "form-error";
      
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      const result = signinClient(email, password);
      
      if (result.success) {
        // Redirect to originally intended page if set, else dashboard
        const redirect = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect || "client-dashboard.html";
      } else {
        formError.textContent = result.message;
        formError.className = "form-error show";
      }
    });
  }
});

// Handle logout
document.addEventListener("DOMContentLoaded", function() {
  const logoutBtn = document.getElementById("clientLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
      e.preventDefault();
      logoutClient();
    });
  }
});

// Handle password change
document.addEventListener("DOMContentLoaded", function() {
  const passwordForm = document.getElementById("passwordChangeForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const formError = document.getElementById("passwordError");
      const formSuccess = document.getElementById("passwordSuccess");
      
      formError.textContent = "";
      formSuccess.textContent = "";
      formError.className = "form-error";
      formSuccess.className = "form-success";
      
      const client = getCurrentClient();
      if (!client) {
        window.location.href = "client-signin.html";
        return;
      }
      
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmNewPassword").value;
      
      if (newPassword !== confirmPassword) {
        formError.textContent = "New passwords do not match";
        formError.className = "form-error show";
        return;
      }
      
      if (newPassword.length < 6) {
        formError.textContent = "Password must be at least 6 characters";
        formError.className = "form-error show";
        return;
      }
      
      const result = changePassword(client.id, oldPassword, newPassword);
      
      if (result.success) {
        formSuccess.textContent = result.message;
        formSuccess.className = "form-success show";
        passwordForm.reset();
      } else {
        formError.textContent = result.message;
        formError.className = "form-error show";
      }
    });
  }
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initClientStorage,
    getClients,
    getCurrentClient,
    signupClient,
    signinClient,
    logoutClient,
    changePassword,
    getClientBookings,
    getClientComplaints,
    requireClientAuth
  };
}
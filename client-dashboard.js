// Client Dashboard Module
// Handles displaying client data, complaints, bookings, routes, and driver details

// Get current client
function getCurrentClient() {
  const client = localStorage.getItem("loggedInClient");
  return client ? JSON.parse(client) : null;
}

// Get all buses
function getBusData() {
  return JSON.parse(localStorage.getItem("busData")) || [];
}

// Get all drivers
function getDriverData() {
  return JSON.parse(localStorage.getItem("driverData")) || [];
}

// Get all complaints
function getComplaintData() {
  return JSON.parse(localStorage.getItem("complaintData")) || [];
}

// Get all bookings
function getBookingData() {
  return JSON.parse(localStorage.getItem("bookingData")) || [];
}

// Get client-specific bookings
function getClientBookingData(client) {
  const clientBookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  return clientBookings.filter(b => b.clientId === client.id || b.roll === client.rollNumber || b.email === client.email);
}

// Display client info in header
function displayClientInfo() {
  const client = getCurrentClient();
  if (!client) {
    window.location.href = "client-signin.html";
    return;
  }

  document.getElementById("clientName").textContent = client.fullName || client.name || "Client";
  document.getElementById("clientRoll").textContent = client.rollNumber || client.roll || "-";
  document.getElementById("clientEmail").textContent = client.email || "-";
  document.getElementById("clientContact").textContent = client.contact || client.phone || "-";
  document.getElementById("clientDegree").textContent = client.degreeName || client.degree || "-";
  document.getElementById("clientSpecialization").textContent = client.specialization || "-";
  document.getElementById("clientYearStart").textContent = client.yearStart || "-";
  document.getElementById("clientYearEnd").textContent = client.yearEnd || "-";
  document.getElementById("clientAddress").textContent = client.address || "-";
}

// Display complaints
function displayComplaints() {
  const client = getCurrentClient();
  if (!client) return;

  const complaints = getComplaintData();
  const clientComplaints = complaints.filter(c => c.clientId === client.id || c.rollNumber === client.rollNumber || c.email === client.email);
  
  const container = document.getElementById("complaintsList");
  
  if (clientComplaints.length === 0) {
    container.innerHTML = '<p class="empty-message">No complaints submitted yet. <a href="help.html">Submit a complaint</a></p>';
    return;
  }

  const statusColors = {
    "Resolved": "status-resolved",
    "In Progress": "status-inprogress",
    "Pending": "status-pending"
  };

  let html = '<div class="items-grid">';
  clientComplaints.forEach(complaint => {
    const statusClass = statusColors[complaint.status] || "status-pending";
    const trackingNo = complaint.trackingNumber || "-";
    html += `
      <div class="item-card">
        <div class="item-header">
          <h4>${complaint.type === 'General' ? 'General Complaint' : (complaint.busNumber ? 'Bus ' + complaint.busNumber : 'Bus Complaint')}</h4>
          <span class="status-badge ${statusClass}">${complaint.status || "Pending"}</span>
        </div>
        <div class="item-details">
          <p>
            <strong>Tracking No:</strong> ${trackingNo}
            ${trackingNo !== "-" ? `<button class="copy-btn" onclick="copyToClipboard('${trackingNo}', this)">Copy</button>` : ""}
          </p>
          <p><strong>Details:</strong> ${complaint.details || "N/A"}</p>
          <p><strong>Submitted:</strong> ${complaint.submittedAt ? new Date(complaint.submittedAt).toLocaleDateString() : "-"}</p>
          ${complaint.comment ? `<p><strong>Admin Response:</strong> ${complaint.comment}</p>` : ""}
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

window.copyToClipboard = function(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    btn.style.color = "#16a34a";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = "";
    }, 2000);
  });
};

// Display bookings
function displayBookings() {
  const client = getCurrentClient();
  if (!client) return;

  const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  const clientBookings = bookings.filter(b => b.clientId === client.id || b.roll === client.rollNumber || b.email === client.email);
  
  const container = document.getElementById("bookingsList");
  
  if (clientBookings.length === 0) {
    container.innerHTML = '<p class="empty-message">No bookings found. <a href="booking.html">Make a booking</a></p>';
    return;
  }

  let html = '<div class="items-grid">';
  clientBookings.forEach(booking => {
    // If admin hasn't assigned a bus/route yet
    const assignmentStatus = booking.busNumber 
      ? `<span class="status-badge status-resolved">Assigned: Bus ${booking.busNumber}</span>`
      : `<span class="status-badge status-pending">Pending Assignment</span>`;
    
    const assignmentMessage = !booking.busNumber
      ? `<p style="color: #d97706; font-size: 0.85rem; font-weight: 500; margin-top: 0.5rem;">You will be assigned a bus route shortly. Please wait until the admin assigns your bus route.</p>`
      : "";

    html += `
      <div class="item-card">
        <div class="item-header">
          <h4>${booking.name || "Booking"}</h4>
          ${assignmentStatus}
        </div>
        <div class="item-details">
          <p><strong>Requested Area:</strong> ${booking.routeCity || "N/A"}</p>
          <p><strong>Roll Number:</strong> ${booking.roll || "N/A"}</p>
          <p><strong>Degree:</strong> ${booking.degree || "N/A"}</p>
          <p><strong>Payment:</strong> ${booking.payment || "N/A"}</p>
          ${assignmentMessage}
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}


// Display routes based on client bookings
function displayRoutes() {
  const client = getCurrentClient();
  if (!client) return;

  const clientBookings = getClientBookingData(client);
  const container = document.getElementById("routesList");

  if (clientBookings.length === 0) {
    container.innerHTML = '<p class="empty-message">No assigned route found. Please <a href="booking.html">make a booking first</a>.</p>';
    return;
  }

  let html = '<div class="items-grid">';
  clientBookings.forEach(booking => {
    let assignedBus = null;
    if (booking.busNumber) {
      assignedBus = getBusData().find(bus => 
        String(bus.busNumber) === String(booking.busNumber) || 
        String(bus.routeNumber) === String(booking.busNumber)
      );
    }

    const routeName = assignedBus ? assignedBus.routeNumber || booking.routeCity : booking.routeCity;
    const badgeHtml = assignedBus 
      ? `<span class="status-badge status-active">Assigned</span>`
      : `<span class="status-badge status-pending">Pending Assignment</span>`;

    let driverInfo = "Not assigned";
    if (assignedBus) {
      if (assignedBus.driverId) {
        const drivers = getDriverData();
        const driver = drivers.find(d => String(d.id) === String(assignedBus.driverId));
        if (driver) driverInfo = driver.name;
      } else if (assignedBus.driverName) {
        driverInfo = assignedBus.driverName;
      }
    }

    html += `
      <div class="item-card">
        <div class="item-header">
          <h4>${routeName}</h4>
          ${badgeHtml}
        </div>
        <div class="item-details">
          <p><strong>Requested Area:</strong> ${booking.routeCity || "N/A"}</p>
          <p><strong>Degree:</strong> ${booking.degree || "N/A"}</p>
          <p><strong>Bus Number:</strong> ${assignedBus ? assignedBus.busNumber : "Not yet assigned"}</p>
          <p><strong>Driver:</strong> ${driverInfo}</p>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// Display driver details
function displayDriverDetails() {
  const client = getCurrentClient();
  if (!client) return;

  const clientBookings = getClientBookingData(client);
  const buses = getBusData();
  const drivers = getDriverData();
  const container = document.getElementById("driverDetails");

  if (clientBookings.length === 0) {
    container.innerHTML = '<p class="empty-message">No driver assigned yet. Please <a href="booking.html">make a booking first</a>.</p>';
    return;
  }

  const assignedDrivers = [];

  clientBookings.forEach(booking => {
    if (booking.busNumber) {
      const bus = buses.find(b => 
        String(b.busNumber) === String(booking.busNumber) || 
        String(b.routeNumber) === String(booking.busNumber)
      );
      if (bus && bus.driverId) {
        const driver = drivers.find(d => String(d.id) === String(bus.driverId));
        if (driver && !assignedDrivers.some(d => String(d.id) === String(driver.id))) {
          assignedDrivers.push(driver);
        }
      }
    }
  });

  if (assignedDrivers.length === 0) {
    container.innerHTML = '<p class="empty-message">No driver details available yet. It will appear after the route is assigned.</p>';
    return;
  }

  let html = '<div class="items-grid">';
  assignedDrivers.forEach(driver => {
    html += `
      <div class="item-card driver-card">
        <div class="driver-avatar">
          <span>${driver.name ? driver.name.charAt(0).toUpperCase() : "D"}</span>
        </div>
        <div class="item-header">
          <h4>${driver.name || "Driver"}</h4>
          <span class="status-badge status-verified">Verified</span>
        </div>
        <div class="item-details">
          <p><strong>Driver ID:</strong> ${driver.id || "N/A"}</p>
          <p><strong>Contact:</strong> ${driver.phone || driver.contact || "N/A"}</p>
          <p><strong>License:</strong> ${driver.license || "N/A"}</p>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// Tab switching
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      // Add active class to clicked
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", function() {
  const client = getCurrentClient();
  if (!client) {
    window.location.href = "client-signin.html";
    return;
  }

  displayClientInfo();
  displayComplaints();
  displayBookings();
  displayRoutes();
  displayDriverDetails();
  initTabs();
});
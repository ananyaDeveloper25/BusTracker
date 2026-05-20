const loggedInClient = JSON.parse(localStorage.getItem("loggedInClient"));
if (!loggedInClient) {
  window.location.href = "client-signin.html";
}

import { getComplaintData, saveComplaintData, getDriverData, getBusData } from "./storage.js";

const allDetails = document.querySelectorAll("details");

allDetails.forEach(target => {
    target.addEventListener("toggle", () => {
        if (target.open) {
            allDetails.forEach(other => {
                if (other !== target) {
                    other.open = false;
                }
            });
        }
    });
});

// Complaint submission

const complaintForm = document.getElementById("complaintForm");
const trackForm = document.getElementById("trackForm");
const trackingResult = document.getElementById("trackingResult");

// Populate bus number dropdown and auto-fill driver name
const complaintTypeSelect = document.getElementById("complaintType");
const busFieldsDiv = document.getElementById("busFields");
const complaintBusNumberInput = document.getElementById("complaintBusNumber");
const complaintDriverNameInput = document.getElementById("complaintDriverName");

let assignedRouteId = "N/A";
let assignedDriverName = "N/A";

// Find client's assigned bus details
function fetchClientBusDetails() {
  const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  const buses = getBusData();
  const drivers = getDriverData();

  const myBooking = bookings.find(b => b.email === loggedInClient.email || (loggedInClient.rollNumber && b.roll === loggedInClient.rollNumber));
  
  if (myBooking && myBooking.busNumber) {
    const bus = buses.find(b => String(b.busNumber) === String(myBooking.busNumber) || String(b.routeNumber) === String(myBooking.busNumber));
    if (bus) {
      assignedRouteId = bus.routeNumber || bus.busNumber;
      if (bus.driverId) {
        const driver = drivers.find(d => String(d.id) === String(bus.driverId));
        if (driver) assignedDriverName = driver.name;
      }
    } else {
      assignedRouteId = myBooking.busNumber; // Fallback
    }
  }
}

fetchClientBusDetails();

complaintTypeSelect.addEventListener("change", function() {
  if (this.value === "bus") {
    busFieldsDiv.style.display = "block";
    complaintBusNumberInput.value = assignedRouteId === "N/A" ? "No route assigned yet" : `Route ${assignedRouteId}`;
    complaintDriverNameInput.value = assignedDriverName;
  } else {
    busFieldsDiv.style.display = "none";
    complaintBusNumberInput.value = "N/A";
    complaintDriverNameInput.value = "N/A";
  }
});

// Pre-populate complaint form fields if logged-in client exists
document.addEventListener("DOMContentLoaded", function() {
  if (loggedInClient) {
    if (loggedInClient.name || loggedInClient.fullName) document.getElementById("complaintName").value = loggedInClient.name || loggedInClient.fullName;
    if (loggedInClient.email) document.getElementById("complaintEmail").value = loggedInClient.email;
  }
});

complaintForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get logged in client if available
  const loggedInClient = JSON.parse(localStorage.getItem("loggedInClient"));
  
  const complaint = {
    id: Date.now(),
    trackingNumber: "CMP" + Date.now(),
    name: document.getElementById("complaintName").value,
    email: document.getElementById("complaintEmail").value,
    complaintType: complaintTypeSelect.value,
    busNumber: complaintTypeSelect.value === "bus" ? assignedRouteId : "General Complaint",
    driverName: complaintTypeSelect.value === "bus" ? assignedDriverName : "N/A",
    details: document.getElementById("complaintDetails").value,
    status: "Pending",
    comment: "",
    submittedAt: new Date().toISOString(),
    // Link to client account if logged in
    clientId: loggedInClient ? loggedInClient.id : null,
    rollNumber: loggedInClient ? loggedInClient.rollNumber : null
  };

  const complaints = getComplaintData();
  complaints.push(complaint);
  saveComplaintData(complaints);

  alert(`Complaint submitted successfully! Your tracking number is: ${complaint.trackingNumber}`);
  complaintForm.reset();
});

// Tracking
trackForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const trackingNumber = document.getElementById("trackingNumber").value.trim();
  const complaints = getComplaintData();
  const complaint = complaints.find(c => c.trackingNumber === trackingNumber);

  if (complaint) {
    trackingResult.innerHTML = `
      <div class="tracking-info">
        <h4>Complaint Status</h4>
        <p><strong>Tracking Number:</strong> ${complaint.trackingNumber}</p>
        <p><strong>Status:</strong> ${complaint.status}</p>
        <p><strong>Submitted:</strong> ${new Date(complaint.submittedAt).toLocaleString()}</p>
        ${complaint.comment ? `<p><strong>Admin Comment:</strong> ${complaint.comment}</p>` : ""}
      </div>
    `;
  } else {
    trackingResult.innerHTML = `<p style="color: red;">No complaint found with that tracking number.</p>`;
  }
});
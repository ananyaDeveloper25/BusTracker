import { getComplaintData, saveComplaintData } from "../../storage.js";

const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "../login.html";
}

const complaintsContainer = document.getElementById("complaintsContainer");
const statusFilter = document.getElementById("complaintStatusFilter");
let currentStatusFilter = "all";

// ---- Check for deep-link from students tab ----
const urlParams = new URLSearchParams(window.location.search);
const filterEmail = urlParams.get("email");
const filterStudentId = urlParams.get("studentId");
const filterName = urlParams.get("name");

// Show "filtering for student" banner if deep-linked
const filterBanner = document.getElementById("studentFilterBanner");
if (filterBanner && (filterEmail || filterStudentId)) {
  filterBanner.style.display = "flex";
  filterBanner.querySelector("#filterStudentName").textContent = filterName || filterEmail || "student";
}

function renderComplaints() {
  let complaints = getComplaintData();

  // Apply student deep-link filter
  if (filterEmail) {
    complaints = complaints.filter(c => c.email === filterEmail);
  } else if (filterStudentId) {
    complaints = complaints.filter(c => String(c.clientId) === String(filterStudentId));
  }

  // Apply status filter
  if (currentStatusFilter !== "all") {
    complaints = complaints.filter(c => c.status === currentStatusFilter);
  }

  if (!complaints.length) {
    complaintsContainer.innerHTML = "<p>No complaints exist yet for this filter.</p>";
    return;
  }

  // Get the full list for index lookup
  const allComplaints = getComplaintData();

  let html = "";
  complaints.forEach((complaint) => {
    // Safely find the real index based on a unique identifier instead of object reference
    const index = allComplaints.findIndex(c => c.trackingNumber === complaint.trackingNumber);
    
    html += `
      <div class="complaint-card">
        <div class="card-header">
          <h3>Tracking: ${complaint.trackingNumber}</h3>
          <span class="status status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
        </div>
        <div class="card-body">
          <p><strong>Name:</strong> ${complaint.name}</p>
          <p><strong>Email:</strong> ${complaint.email}</p>
          <p><strong>Bus Number:</strong> ${complaint.busNumber}</p>
          <p><strong>Driver Name:</strong> ${complaint.driverName}</p>
          <p><strong>Details:</strong> ${complaint.details}</p>
          <p><strong>Submitted:</strong> ${new Date(complaint.submittedAt).toLocaleString()}</p>
          ${complaint.comment ? `<p><strong>Comment:</strong> ${complaint.comment}</p>` : ""}
        </div>
        <div class="card-actions">
          <select id="status-${index}" class="status-select">
            <option value="Pending" ${complaint.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${complaint.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${complaint.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
          <textarea id="comment-${index}" placeholder="Add comment..." class="comment-input">${complaint.comment || ""}</textarea>
          <button class="update-btn" data-id="${index}">Update</button>
        </div>
      </div>
    `;
  });
  complaintsContainer.innerHTML = html;

  document.querySelectorAll(".update-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      updateComplaint(id);
    });
  });
}

function updateComplaint(index) {
  if (index === -1) return;
  const complaints = getComplaintData();
  const status = document.getElementById(`status-${index}`).value;
  const comment = document.getElementById(`comment-${index}`).value.trim();
  complaints[index].status = status;
  complaints[index].comment = comment;
  saveComplaintData(complaints);
  
  // Show quick visual feedback without using annoying alerts
  const btn = document.querySelector(`.update-btn[data-id="${index}"]`);
  if (btn) {
    const originalText = btn.textContent;
    btn.textContent = "Saved ✓";
    btn.style.background = "#10b981";
    setTimeout(() => {
      renderComplaints();
    }, 500);
  } else {
    renderComplaints();
  }
}

if (statusFilter) {
  statusFilter.addEventListener("change", (e) => {
    currentStatusFilter = statusFilter.value;
    renderComplaints();
  });
}

renderComplaints();
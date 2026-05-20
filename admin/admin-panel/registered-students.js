// Auth is handled by admin.js

// ---- Data functions ----
function getClients() {
  return JSON.parse(localStorage.getItem("clientData")) || [];
}

function getComplaints() {
  return JSON.parse(localStorage.getItem("complaintData")) || [];
}

function getBookings() {
  return JSON.parse(localStorage.getItem("clientBookings")) || [];
}

function getBuses() {
  return JSON.parse(localStorage.getItem("busData")) || [];
}

function getDrivers() {
  return JSON.parse(localStorage.getItem("driverData")) || [];
}

function getComplaintSummary(student) {
  const complaints = getComplaints();
  const mine = complaints.filter(c =>
    c.email === student.email ||
    (student.id && String(c.clientId) === String(student.id)) ||
    (student.rollNumber && c.rollNumber === student.rollNumber)
  );
  const total = mine.length;
  const resolved = mine.filter(c => c.status === "Resolved").length;
  const pending = mine.filter(c => c.status === "Pending").length;
  const inProgress = mine.filter(c => c.status === "In Progress").length;
  return { total, resolved, pending, inProgress, complaints: mine };
}

// ---- Render ----
let allStudents = [];

function buildComplaintBadges(summary) {
  if (summary.total === 0) return `<span class="badge badge-none">No Complaints</span>`;
  let badges = "";
  if (summary.pending > 0) badges += `<span class="badge badge-pending">${summary.pending} Pending</span>`;
  if (summary.inProgress > 0) badges += `<span class="badge badge-progress">${summary.inProgress} In Progress</span>`;
  if (summary.resolved > 0) badges += `<span class="badge badge-resolved">${summary.resolved} Resolved</span>`;
  return badges;
}

function viewComplaints(student) {
  const modal = document.getElementById("studentModal");
  const modalName = document.getElementById("modalStudentName");
  const modalDetails = document.getElementById("modalStudentDetails");
  
  const name = student.fullName || student.name || "-";
  const degree = student.degreeName || student.degree || "-";
  const batch = `${student.yearStart || ""}${student.yearStart && student.yearEnd ? "–" : ""}${student.yearEnd || ""}` || "-";
  const summary = getComplaintSummary(student);
  
  // Find booking details
  const bookings = getBookings();
  const studentBooking = bookings.find(b => 
    b.email === student.email || 
    (student.rollNumber && b.roll === student.rollNumber) || 
    (student.id && b.clientId === student.id)
  );

  let bookingHtml = "<p>No active bookings.</p>";
  if (studentBooking) {
    const buses = getBuses();
    const drivers = getDrivers();
    
    let busInfo = "Not yet assigned";
    let driverInfo = "Not assigned";
    
    if (studentBooking.busNumber) {
      const bus = buses.find(b => 
        String(b.busNumber) === String(studentBooking.busNumber) || 
        String(b.routeNumber) === String(studentBooking.busNumber)
      );
      if (bus) {
        busInfo = `Bus ${bus.busNumber || "-"} (Route ${bus.routeNumber || "-"})`;
        if (bus.driverId) {
          const driver = drivers.find(d => String(d.id) === String(bus.driverId));
          if (driver) driverInfo = `${driver.name} (${driver.phone || driver.contact || "No phone"})`;
        } else if (bus.driverName) {
          driverInfo = `${bus.driverName}`;
        }
      } else {
        busInfo = `Bus/Route ${studentBooking.busNumber} (Not Found)`;
      }
    }
    
    bookingHtml = `
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; border: 1px solid #e2e8f0;">
        <p><strong>Requested Route:</strong> ${studentBooking.routeCity || "-"}</p>
        <p><strong>Payment Status:</strong> <span class="badge badge-resolved">${studentBooking.payment || "Confirmed"}</span></p>
        <p><strong>Assigned Bus:</strong> ${busInfo}</p>
        <p><strong>Driver:</strong> ${driverInfo}</p>
      </div>
    `;
  }

  modalName.textContent = name;
  modalDetails.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
      <div>
        <p><strong>Roll No:</strong> ${student.rollNumber || "-"}</p>
        <p><strong>Email:</strong> ${student.email || "-"}</p>
        <p><strong>Contact:</strong> ${student.contact || student.phone || "-"}</p>
      </div>
      <div>
        <p><strong>Degree:</strong> ${degree} ${student.specialization ? " / " + student.specialization : ""}</p>
        <p><strong>Batch:</strong> ${batch}</p>
        <p><strong>Address:</strong> ${student.address || "-"}</p>
      </div>
    </div>

    <h4 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">Booking Details</h4>
    ${bookingHtml}

    <h4 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 0.5rem;">Complaints Summary</h4>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <span class="badge badge-none" style="font-size:0.9rem;">Total: ${summary.total}</span>
      <span class="badge badge-pending" style="font-size:0.9rem;">Pending: ${summary.pending}</span>
      <span class="badge badge-progress" style="font-size:0.9rem;">In Progress: ${summary.inProgress}</span>
      <span class="badge badge-resolved" style="font-size:0.9rem;">Resolved: ${summary.resolved}</span>
    </div>
  `;

  modal.style.display = "flex";
}

document.getElementById("closeStudentModalBtn")?.addEventListener("click", () => {
  document.getElementById("studentModal").style.display = "none";
});

function renderTable(students) {
  const tbody = document.getElementById("studentsTableBody");
  const cards = document.getElementById("studentCards");
  const emptyMsg = document.getElementById("emptyMsg");
  const countEl = document.getElementById("studentsCount");

  countEl.textContent = `${students.length} Student${students.length !== 1 ? "s" : ""}`;

  if (!students.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state" style="padding: 4rem 2rem;">
            <div class="empty-icon">🎓</div>
            <h3>No students found</h3>
            <p>No students match your current filter.</p>
          </div>
        </td>
      </tr>
    `;
    cards.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🎓</div>
        <h3>No students found</h3>
        <p>No students match your current filter.</p>
      </div>
    `;
    if (emptyMsg) emptyMsg.style.display = "none";
    return;
  }
  if (emptyMsg) emptyMsg.style.display = "none";

  // Desktop table
  let tableHtml = "";
  students.forEach((student, i) => {
    const summary = getComplaintSummary(student);
    const name = student.fullName || student.name || "-";
    const degree = student.degreeName || student.degree || "-";
    const batch = `${student.yearStart || ""}${student.yearStart && student.yearEnd ? "–" : ""}${student.yearEnd || ""}` || "-";
    tableHtml += `
      <tr class="student-row" onclick="viewStudentComplaints(${i})">
        <td>${i + 1}</td>
        <td class="student-name">${name}</td>
        <td>${student.rollNumber || "-"}</td>
        <td>${student.email || "-"}</td>
        <td>${student.contact || "-"}</td>
        <td>${degree}${student.specialization ? " / " + student.specialization : ""}</td>
        <td>${batch}</td>
        <td class="complaint-badges">${buildComplaintBadges(summary)}</td>
        <td>
          <button class="view-btn" onclick="event.stopPropagation(); viewStudentComplaints(${i})">
            View Details
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = tableHtml;

  // Mobile cards
  let cardsHtml = "";
  students.forEach((student, i) => {
    const summary = getComplaintSummary(student);
    const name = student.fullName || student.name || "-";
    cardsHtml += `
      <div class="student-card" onclick="viewStudentComplaints(${i})">
        <div class="student-card-header">
          <div class="student-avatar">${name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="student-card-name">${name}</div>
            <div class="student-card-roll">${student.rollNumber || "-"}</div>
          </div>
          <div class="complaint-badges" style="margin-left:auto;">${buildComplaintBadges(summary)}</div>
        </div>
        <div class="student-card-body">
          <div class="student-card-row"><span>Email</span><span>${student.email || "-"}</span></div>
          <div class="student-card-row"><span>Contact</span><span>${student.contact || "-"}</span></div>
          <div class="student-card-row"><span>Degree</span><span>${student.degreeName || "-"}</span></div>
          <div class="student-card-row"><span>Batch</span><span>${student.yearStart || ""}–${student.yearEnd || ""}</span></div>
        </div>
        <button class="view-btn" style="width:100%; margin-top:0.5rem;" onclick="event.stopPropagation(); viewStudentComplaints(${i})">View Details →</button>
      </div>
    `;
  });
  cards.innerHTML = cardsHtml;
}

window.viewStudentComplaints = function(displayIndex) {
  // displayIndex is index in the currently filtered list shown in table
  const searchVal = document.getElementById("searchInput").value.toLowerCase();
  const filterVal = document.getElementById("complaintFilter").value;
  const filtered = applyFilters(allStudents, searchVal, filterVal);
  const student = filtered[displayIndex];
  if (student) viewComplaints(student);
};

function applyFilters(students, search, complaintFilter) {
  let result = students;
  if (search) {
    result = result.filter(s =>
      (s.fullName || s.name || "").toLowerCase().includes(search) ||
      (s.email || "").toLowerCase().includes(search) ||
      (s.rollNumber || "").toLowerCase().includes(search)
    );
  }
  if (complaintFilter === "has-complaints") {
    result = result.filter(s => getComplaintSummary(s).total > 0);
  } else if (complaintFilter === "no-complaints") {
    result = result.filter(s => getComplaintSummary(s).total === 0);
  } else if (complaintFilter === "has-pending") {
    result = result.filter(s => getComplaintSummary(s).pending > 0);
  } else if (complaintFilter === "all-resolved") {
    result = result.filter(s => {
      const sum = getComplaintSummary(s);
      return sum.total > 0 && sum.pending === 0 && sum.inProgress === 0;
    });
  }
  return result;
}

function init() {
  allStudents = getClients();
  renderTable(allStudents);

  document.getElementById("searchInput").addEventListener("input", () => {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("complaintFilter").value;
    renderTable(applyFilters(allStudents, search, filter));
  });

  document.getElementById("complaintFilter").addEventListener("change", () => {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("complaintFilter").value;
    renderTable(applyFilters(allStudents, search, filter));
  });
}

document.addEventListener("DOMContentLoaded", init);

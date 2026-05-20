// Auth is handled by admin.js

function getBookings() {
  return JSON.parse(localStorage.getItem("clientBookings")) || [];
}

function saveBookings(bookings) {
  localStorage.setItem("clientBookings", JSON.stringify(bookings));
}

function getBusData() {
  return JSON.parse(localStorage.getItem("busData")) || [];
}

let allBookings = [];

function renderBookings(filter = "all") {
  allBookings = getBookings();
  let displayBookings = allBookings;

  if (filter === "pending") {
    displayBookings = allBookings.filter(b => !b.busNumber || b.busNumber === "");
  }

  const tbody = document.getElementById("bookingsTableBody");
  const cardsGrid = document.getElementById("studentCardsGrid");
  const emptyMsg = document.getElementById("emptyMsg");
  
  if (displayBookings.length === 0) {
    if (tbody) tbody.innerHTML = "";
    if (cardsGrid) cardsGrid.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  
  emptyMsg.style.display = "none";
  let tableHtml = "";
  let cardsHtml = "";
  
  const allBuses = getBusData();
  const validBuses = allBuses.filter(bus => bus.routeNumber || bus.busNumber);

  let busOptions = "";
  let selectDisabled = "";
  let tooltipAttr = "";
  
  if (validBuses.length === 0) {
    busOptions = '<option value="">No routes available</option>';
    selectDisabled = "disabled";
    tooltipAttr = 'title="Add routes first"';
  } else {
    busOptions = '<option value="">-- Unassigned --</option>';
    const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
    
    validBuses.forEach(bus => {
      const routeIdentifier = bus.routeNumber || bus.busNumber;
      const filledCount = bookings.filter(b => String(b.busNumber) === String(routeIdentifier)).length;
      
      if (filledCount >= 42) {
        busOptions += `<option value="${routeIdentifier}" disabled title="No seats available">Route ${routeIdentifier} - FULL</option>`;
      } else {
        busOptions += `<option value="${routeIdentifier}">Route ${routeIdentifier} (${bus.location || "N/A"}) - ${filledCount}/42 seats</option>`;
      }
    });
  }
  
  const clients = JSON.parse(localStorage.getItem("clientData")) || [];

  displayBookings.forEach((booking) => {
    const index = allBookings.indexOf(booking);
    const client = clients.find(c => c.email === booking.email || (booking.roll && c.rollNumber === booking.roll));
    const displayContact = booking.contact || (client ? client.contact || client.phone : null) || "-";
    const displayAddress = booking.address || (client ? client.address : null) || "-";

    const selectedOptions = busOptions.replace(
      `value="${booking.busNumber || ""}"`,
      `value="${booking.busNumber || ""}" selected`
    );

    tableHtml += `
      <tr>
        <td class="student-name">${booking.name || "-"}</td>
        <td>${booking.roll || "-"}</td>
        <td style="font-size:0.8rem; line-height:1.4;">
          <div><strong>Email:</strong> ${booking.email || "-"}</div>
          <div><strong>Contact:</strong> ${displayContact}</div>
          <div><strong>Address:</strong> ${displayAddress}</div>
          <div><strong>Degree:</strong> ${booking.degree || "-"}</div>
          <div><strong>End Year:</strong> ${booking.gradYear || "-"}</div>
        </td>
        <td>${booking.routeCity || "-"}</td>
        <td><span class="badge badge-resolved">${booking.payment || "Confirmed"}</span></td>
        <td ${tooltipAttr}>
          <select id="busSelect-${index}" class="filter-select" style="padding: 0.35rem 0.5rem; max-width: 150px; ${selectDisabled ? 'opacity: 0.6; cursor: not-allowed;' : ''}" ${selectDisabled} ${tooltipAttr} onchange="document.getElementById('saveBtn-${index}').disabled = !this.value; document.getElementById('saveBtn-${index}').style.opacity = !this.value ? '0.5' : '1';">
            ${selectedOptions}
          </select>
        </td>
        <td>
          <button id="saveBtn-${index}" class="view-btn" onclick="assignBus(${index})" ${!booking.busNumber || selectDisabled ? 'disabled' : ''} style="${!booking.busNumber || selectDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Save</button>
        </td>
      </tr>
    `;

    cardsHtml += `
      <div class="student-card">
        <div class="student-card-header">
          <div class="student-avatar">${(booking.name || "S")[0]}</div>
          <div>
            <div class="student-card-name">${booking.name || "-"}</div>
            <div class="student-card-roll">${booking.roll || "-"}</div>
          </div>
        </div>
        <div class="student-card-body">
          <div class="student-card-row">
            <span>Area</span>
            <span>${booking.routeCity || "-"}</span>
          </div>
          <div class="student-card-row">
            <span>Payment</span>
            <span>${booking.payment || "Confirmed"}</span>
          </div>
          <div style="grid-column: span 2; margin-top: 10px;">
            <span style="font-size:0.72rem; color:#94a3b8; font-weight:600; text-transform:uppercase;">Assign Route</span>
            <select id="busSelect-mob-${index}" class="filter-select" style="width:100%; margin-top:4px;" ${selectDisabled} onchange="document.getElementById('saveBtn-mob-${index}').disabled = !this.value; document.getElementById('saveBtn-mob-${index}').style.opacity = !this.value ? '0.5' : '1';">
              ${selectedOptions}
            </select>
          </div>
          <div style="grid-column: span 2; margin-top: 10px;">
             <button id="saveBtn-mob-${index}" class="view-btn" style="width:100%; ${!booking.busNumber || selectDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}" onclick="assignBus(${index}, true)" ${!booking.busNumber || selectDisabled ? 'disabled' : ''}>Save Changes</button>
          </div>
        </div>
      </div>
    `;
  });
  
  if (tbody) tbody.innerHTML = tableHtml;
  if (cardsGrid) cardsGrid.innerHTML = cardsHtml;
}

window.assignBus = function(index, isMobile = false) {
  const selectId = isMobile ? `busSelect-mob-${index}` : `busSelect-${index}`;
  const btnId = isMobile ? `saveBtn-mob-${index}` : `saveBtn-${index}`;
  const select = document.getElementById(selectId);
  const busNumber = select.value;
  
  allBookings[index].busNumber = busNumber;
  saveBookings(allBookings);
  
  // Provide visual feedback
  const btn = document.getElementById(btnId);
  const originalText = btn.textContent;
  btn.textContent = "Saved!";
  btn.style.background = "#16a34a";
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  renderBookings();
  
  const filterSelect = document.getElementById("bookingFilter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      renderBookings(e.target.value);
    });
  }
});
import { getBusData, saveBusData, getDriverData } from "../../storage.js";

// ---- Auth guard ----
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const loggedInDriver = JSON.parse(localStorage.getItem("loggedInDriver"));

if (!loggedInUser || loggedInUser.role !== "driver" || !loggedInDriver) {
  window.location.href = "../login.html";
}

// ---- Show driver greeting ----
const greeting = document.getElementById("driverGreeting");
if (greeting && loggedInDriver) {
  greeting.textContent = `Welcome, ${loggedInDriver.name}`;
}

// ---- Show driver info bar ----
const driverInfoBar = document.getElementById("driverInfo");
if (driverInfoBar && loggedInDriver) {
  driverInfoBar.style.display = "block";
  driverInfoBar.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
      <p style="margin:0;"><strong>Name:</strong> ${loggedInDriver.name}</p>
      <p style="margin:0;"><strong>License:</strong> ${loggedInDriver.license}</p>
      <p style="margin:0;"><strong>Contact:</strong> ${loggedInDriver.contact}</p>
      <p style="margin:0;"><strong>Blood Group:</strong> ${loggedInDriver.bloodGroup}</p>
    </div>
  `;
}

// ---- Find assigned bus ----
const buses = getBusData();
let currentRoute = buses.find(b => Number(b.driverId) === Number(loggedInDriver.id));

const noBusMsg = document.getElementById("noBusMsg");
const busPanel = document.getElementById("busPanel");

if (!currentRoute) {
  noBusMsg.style.display = "block";
  busPanel.style.display = "none";
} else {
  noBusMsg.style.display = "none";
  busPanel.style.display = "block";
  renderRouteDetails();
  renderStops();
}

// ---- Render functions ----
function renderRouteDetails() {
  const title = document.getElementById("routeTitle");
  const details = document.getElementById("routeDetails");
  
  if (title) title.textContent = `Route ${currentRoute.routeNumber || ""} — Bus ${currentRoute.busNumber || ""}`;
  
  if (details) {
    const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
    const filledCount = bookings.filter(b => String(b.busNumber) === String(currentRoute.routeNumber || currentRoute.busNumber)).length;
    
    details.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
        <p style="margin:0;"><strong>Bus Number:</strong> ${currentRoute.busNumber || "-"}</p>
        <p style="margin:0;"><strong>Route:</strong> ${currentRoute.routeNumber || "-"}</p>
        <p style="margin:0;"><strong>Location:</strong> ${currentRoute.location || "-"}</p>
        <p style="margin:0;"><strong>Capacity:</strong> 42</p>
        <p style="margin:0;"><strong>Seats Filled:</strong> ${filledCount}</p>
      </div>
    `;
  }
}

function renderStops() {
  const container = document.getElementById("stopsContainer");
  if (!container || !currentRoute) return;

  const firstUnset = currentRoute.stops.findIndex(s => !s.arrival);
  
  let html = `<h3 style="margin: 1.5rem 0 0.75rem; color: #1e3a5f;">Morning Trip (To Campus)</h3>`;

  // Desktop Table
  let desktopTable = `
    <div class="desktop-table-wrapper" style="overflow-x:auto; -webkit-overflow-scrolling: touch;">
      <table style="width:100%; min-width: 600px; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 8px rgba(0,0,0,0.07);">
        <thead>
          <tr style="background:#1e3a5f; color:#fff;">
            <th style="padding:12px 16px; text-align:left;">#</th>
            <th style="padding:12px 16px; text-align:left;">Stop Name</th>
            <th style="padding:12px 16px; text-align:left;">Scheduled</th>
            <th style="padding:12px 16px; text-align:left;">Actual Arrival</th>
            <th style="padding:12px 16px; text-align:left;">Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Mobile Cards
  let mobileCards = `<div class="stop-cards">`;

  currentRoute.stops.forEach((stop, idx) => {
    const isLate = stop.arrival && stop.time && stop.arrival > stop.time;
    let statusColor = "#94a3b8";
    if (stop.arrival) {
      statusColor = isLate ? "#dc2626" : "#16a34a";
    } else if (idx === firstUnset) {
      statusColor = "#2563eb";
    }

    desktopTable += `
      <tr style="background:${idx % 2 === 0 ? "#f8fafc" : "#fff"}; border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px; color:#64748b;">${idx + 1}</td>
        <td style="padding:12px 16px; font-weight:500;">${stop.name}</td>
        <td style="padding:12px 16px; color:#64748b;">${stop.time || "-"}</td>
        <td style="padding:12px 16px; color:${statusColor}; font-weight:600;">${stop.arrival || "-"}</td>
        <td style="padding:12px 16px;">
          ${!stop.arrival && idx === firstUnset
            ? `<button onclick="addArrivalTime(${idx})" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.88rem;font-weight:600;">✓ Mark Arrived</button>`
            : stop.arrival
              ? `<span style="color:${statusColor}; font-size:0.88rem;">✓ Locked ${isLate ? '(Late)' : ''}</span>`
              : `<button disabled style="background:#e2e8f0;color:#94a3b8;border:none;border-radius:8px;padding:6px 14px;font-size:0.88rem;cursor:not-allowed;">Mark Arrived</button>`
          }
        </td>
      </tr>
    `;

    mobileCards += `
      <div class="stop-card">
        <div class="stop-card-header">
          <span class="stop-card-name">${stop.name}</span>
          <span class="stop-card-time">Scheduled: ${stop.time || "-"}</span>
        </div>
        ${stop.arrival 
          ? `<div class="locked-status ${isLate ? 'late' : ''}">✓ ${stop.arrival} ${isLate ? '(Late Arrival)' : '(On Time)'}</div>`
          : `<button class="mark-btn-large" ${idx === firstUnset ? '' : 'disabled'} onclick="addArrivalTime(${idx})">
               ${idx === firstUnset ? '✓ MARK ARRIVED' : 'Waiting for Previous Stop'}
             </button>`
        }
      </div>
    `;
  });

  desktopTable += `</tbody></table></div>`;
  mobileCards += `</div>`;
  html += desktopTable + mobileCards;

  // Return Trip section
  const returnStops = [...currentRoute.stops].reverse();
  const firstReturnUnset = returnStops.findIndex(s => !s.returnArrival);
  
  // Check if Morning Trip is complete
  const morningComplete = currentRoute.stops.every(s => s.arrival);
  
  html += `<h3 style="margin: 2rem 0 0.75rem; color: #1e3a5f;">Return Trip (From Campus)</h3>`;
  if (!morningComplete) {
    html += `<div style="background:#fff7ed; color:#9a3412; padding:10px 15px; border-radius:8px; border:1px solid #ffedd5; font-size:0.9rem; margin-bottom:1rem; font-weight:500;">
      ⚠️ Return Trip updates will be available once the Morning Trip is fully completed.
    </div>`;
  }

  let desktopTableReturn = `
    <div class="desktop-table-wrapper" style="overflow-x:auto; -webkit-overflow-scrolling: touch;">
      <table style="width:100%; min-width: 600px; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 8px rgba(0,0,0,0.07);">
        <thead>
          <tr style="background:#1e3a5f; color:#fff;">
            <th style="padding:12px 16px; text-align:left;">#</th>
            <th style="padding:12px 16px; text-align:left;">Stop Name</th>
            <th style="padding:12px 16px; text-align:left;">Time</th>
            <th style="padding:12px 16px; text-align:left;">Actual Departure</th>
            <th style="padding:12px 16px; text-align:left;">Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  let mobileCardsReturn = `<div class="stop-cards">`;

  returnStops.forEach((stop, returnIdx) => {
    const originalIdx = currentRoute.stops.length - 1 - returnIdx;
    let statusColor = stop.returnArrival ? "#16a34a" : (returnIdx === firstReturnUnset ? "#2563eb" : "#94a3b8");
    const displayTime = returnIdx === 0 ? "16:45" : "-";

    const isActionable = morningComplete && returnIdx === firstReturnUnset;

    desktopTableReturn += `
      <tr style="background:${returnIdx % 2 === 0 ? "#f8fafc" : "#fff"}; border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px; color:#64748b;">${returnIdx + 1}</td>
        <td style="padding:12px 16px; font-weight:500;">${stop.name}</td>
        <td style="padding:12px 16px; color:#64748b;">${displayTime}</td>
        <td style="padding:12px 16px; color:${statusColor}; font-weight:600;">${stop.returnArrival || "-"}</td>
        <td style="padding:12px 16px;">
          ${!stop.returnArrival && isActionable
            ? `<button onclick="addReturnArrivalTime(${originalIdx})" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.88rem;font-weight:600;">✓ Mark Reached</button>`
            : stop.returnArrival
              ? `<span style="color:${statusColor}; font-size:0.88rem;">✓ Locked</span>`
              : `<button disabled style="background:#e2e8f0;color:#94a3b8;border:none;border-radius:8px;padding:6px 14px;font-size:0.88rem;cursor:not-allowed;">Mark Reached</button>`
          }
        </td>
      </tr>
    `;

    mobileCardsReturn += `
      <div class="stop-card" style="${!morningComplete ? 'opacity:0.7;' : ''}">
        <div class="stop-card-header">
          <span class="stop-card-name">${stop.name}</span>
          <span class="stop-card-time">${returnIdx === 0 ? 'Departure: 16:45' : 'Drop-off'}</span>
        </div>
        ${stop.returnArrival 
          ? `<div class="locked-status">✓ Reached at ${stop.returnArrival}</div>`
          : `<button class="mark-btn-large" ${isActionable ? '' : 'disabled'} onclick="addReturnArrivalTime(${originalIdx})">
               ${!morningComplete ? 'Locked until Morning Trip ends' : (returnIdx === firstReturnUnset ? '✓ MARK REACHED' : 'Waiting...')}
             </button>`
        }
      </div>
    `;
  });

  desktopTableReturn += `</tbody></table></div>`;
  mobileCardsReturn += `</div>`;
  html += desktopTableReturn + mobileCardsReturn;

  container.innerHTML = html;
}

// ---- Mark arrival time ----
window.addArrivalTime = function(idx) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  currentRoute.stops[idx].arrival = `${hh}:${mm}`;

  const buses = getBusData();
  const routeIdx = buses.findIndex(b => b.busNumber === currentRoute.busNumber);
  if (routeIdx !== -1) {
    buses[routeIdx] = currentRoute;
    saveBusData(buses);
  }
  renderStops();
};

window.addReturnArrivalTime = function(idx) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  currentRoute.stops[idx].returnArrival = `${hh}:${mm}`;

  const buses = getBusData();
  const routeIdx = buses.findIndex(b => b.busNumber === currentRoute.busNumber);
  if (routeIdx !== -1) {
    buses[routeIdx] = currentRoute;
    saveBusData(buses);
  }
  renderStops();
};

// ---- Logout & Reset ----
document.addEventListener("DOMContentLoaded", function() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loggedInDriver");
      window.location.href = "../login.html";
    });
  }

  const resetBtn = document.getElementById("resetTripBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      if (!currentRoute) return;
      if (confirm("Are you sure you want to reset all trip data for today? This will clear all arrival and departure marks.")) {
        // Clear all arrival and returnArrival marks
        currentRoute.stops.forEach(stop => {
          delete stop.arrival;
          delete stop.returnArrival;
        });

        const buses = getBusData();
        const routeIdx = buses.findIndex(b => b.busNumber === currentRoute.busNumber);
        if (routeIdx !== -1) {
          buses[routeIdx] = currentRoute;
          saveBusData(buses);
        }
        
        renderStops();
        alert("Trip data has been reset. You can start a new trip now.");
      }
    });
  }
});

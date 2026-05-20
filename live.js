import { getBusData } from "./storage.js";

// Auth guard — require login for live tracking
const loggedInClient = JSON.parse(localStorage.getItem("loggedInClient"));
if (!loggedInClient) {
  sessionStorage.setItem("redirectAfterLogin", "live.html");
  window.location.href = "client-signin.html";
}

function getLastStopInfo(stops) {
  if (!Array.isArray(stops) || !stops.length) return { lastStop: "-", status: "-", statusClass: "" };
  let lastIdx = -1;
  for (let i = stops.length - 1; i >= 0; i--) {
    if (stops[i].arrival) {
      lastIdx = i;
      break;
    }
  }
  if (lastIdx === -1) return { lastStop: "-", status: "Not started", statusClass: "" };
  const stop = stops[lastIdx];
  let status = "On time";
  let statusClass = "on-time";
  if (stop.time && stop.arrival) {
    const [sh, sm] = stop.time.split(":").map(Number);
    const [ah, am] = stop.arrival.split(":").map(Number);
    const schedMins = sh * 60 + sm;
    const arrMins = ah * 60 + am;
    if (arrMins > schedMins + 5) {
      status = "Late";
      statusClass = "late";
    }
  }
  return { lastStop: stop.name, status, statusClass };
}

function renderLiveTracking() {
  const buses = getBusData();

  if (!loggedInClient) return;

  // Find bookings for this client
  const clientBookings = (JSON.parse(localStorage.getItem("clientBookings")) || [])
    .filter(b => b.clientId === loggedInClient.id || b.roll === loggedInClient.rollNumber || b.email === loggedInClient.email);

  // Collect assigned bus numbers from bookings
  const assignedBusNumbers = clientBookings.map(b => b.busNumber).filter(Boolean);

  const tbody = document.getElementById("liveTrackingTbody");
  const mobileCardsContainer = document.getElementById("mobileStatusCards");
  if (!tbody || !mobileCardsContainer) return;

  tbody.innerHTML = "";
  mobileCardsContainer.innerHTML = "";

  // Filter buses to only assigned ones
  const filteredBuses = assignedBusNumbers.length > 0
    ? buses.filter(bus => 
        assignedBusNumbers.some(num => String(bus.busNumber) === String(num) || String(bus.routeNumber) === String(num))
      )
    : [];

  if (filteredBuses.length === 0) {
    const emptyMsg = assignedBusNumbers.length === 0
      ? 'No bus assigned yet. <a href="booking.html" style="color:#3b82f6;">Make a booking</a> to get a bus assigned.'
      : 'Your assigned bus data is not available yet. Please check back later.';

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">
          ${emptyMsg}
        </td>
      </tr>`;
    
    mobileCardsContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:#64748b;">${emptyMsg}</div>`;
    return;
  }

  filteredBuses.forEach(bus => {
    // Auto calculate seats filled
    const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
    const filledCount = bookings.filter(b => String(b.busNumber) === String(bus.routeNumber || bus.busNumber)).length;
    const capacity = bus.seatsCapacity || 42;
    const seatsLeft = Math.max(0, capacity - filledCount);
    
    const { lastStop, status, statusClass } = getLastStopInfo(bus.stops);

    // Desktop Table
    tbody.innerHTML += `
      <tr>
        <td>${bus.busNumber}</td>
        <td>${bus.routeNumber}</td>
        <td>${lastStop}</td>
        <td><span class="status ${statusClass}">${status}</span></td>
        <td>${seatsLeft}</td>
      </tr>
    `;

    // Mobile Cards
    mobileCardsContainer.innerHTML += `
      <div class="status-card">
        <div class="status-card-header">
          <span class="status-card-bus">Bus: ${bus.busNumber}</span>
          <span class="status ${statusClass}">${status}</span>
        </div>
        <div class="status-card-grid">
          <div class="status-card-item">
            <span class="status-card-label">Route</span>
            <span class="status-card-value">${bus.routeNumber}</span>
          </div>
          <div class="status-card-item">
            <span class="status-card-label">Seats Left</span>
            <span class="status-card-value">${seatsLeft}</span>
          </div>
          <div class="status-card-item" style="grid-column: span 2;">
            <span class="status-card-label">Last Stop Left</span>
            <span class="status-card-value">${lastStop}</span>
          </div>
        </div>
      </div>
    `;
  });

    // Render Node-based Timeline for the first assigned bus
    if (filteredBuses.length > 0) {
        const bus = filteredBuses[0];
        const timelineContainer = document.getElementById("routeTimeline");
        if (!timelineContainer) return;

        let timelineHtml = "";

        // Function to generate timeline HTML
        const generateTimeline = (title, stopsList, isReturn = false) => {
            let lastIdx = -1;
            stopsList.forEach((s, i) => { 
                if (isReturn ? s.returnArrival : s.arrival) lastIdx = i; 
            });

            let html = `
                <div style="background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: #1e293b; font-size: 1.1rem; text-align: center;">${title} — Bus ${bus.busNumber}</h3>
                    <div style="display: flex; align-items: center; justify-content: space-between; position: relative; min-height: 80px;">
                        <!-- Connecting Line Background -->
                        <div style="position: absolute; top: 20px; left: 0; right: 0; height: 4px; background: #e2e8f0; z-index: 1; border-radius: 2px;"></div>
            `;

            // Active Connecting Line
            if (stopsList.length > 1 && lastIdx >= 0) {
                const progressPercentage = (lastIdx / (stopsList.length - 1)) * 100;
                html += `
                    <div style="position: absolute; top: 20px; left: 0; width: ${progressPercentage}%; height: 4px; background: #16a34a; z-index: 2; border-radius: 2px; transition: width 0.5s ease;"></div>
                `;
            }

            stopsList.forEach((stop, idx) => {
                const arrival = isReturn ? stop.returnArrival : stop.arrival;
                const isArrived = !!arrival;
                const isCurrent = idx === lastIdx;
                const nodeColor = isArrived ? "#16a34a" : "#cbd5e1";
                const textColor = isArrived ? "#16a34a" : "#64748b";
                const shadow = isCurrent ? "box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.2);" : "";
                
                html += `
                    <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: ${100 / stopsList.length}%;">
                        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${nodeColor}; border: 4px solid #fff; ${shadow} transition: all 0.3s ease;"></div>
                        <div style="margin-top: 8px; font-weight: ${isArrived ? '600' : '400'}; color: ${textColor}; font-size: 0.85rem; text-align: center; line-height: 1.2;">
                            ${stop.name}
                            ${arrival ? `<br><span style="font-size: 0.75rem; color: #475569;">${arrival}</span>` : ""}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
            return html;
        };

        // Morning Timeline
        timelineHtml += generateTimeline("Morning Journey Progress (To Campus)", bus.stops);

        // Return Timeline (Reversed Stops)
        const returnStops = [...bus.stops].reverse();
        timelineHtml += generateTimeline("Return Journey Progress (From Campus)", returnStops, true);
        
        timelineContainer.innerHTML = timelineHtml;
    }
}

renderLiveTracking();
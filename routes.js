import { getBusData } from "./storage.js";

const LOCATIONS = ["chandigarh", "mohali", "patiala", "kharrar"];
const LOCATION_LABELS = {
  chandigarh: "Chandigarh",
  mohali: "Mohali",
  patiala: "Patiala",
  kharrar: "Kharrar"
};

function renderRoutes() {
  const routesByLocation = {};
  LOCATIONS.forEach(loc => routesByLocation[loc] = []);
  const buses = getBusData();
  buses.forEach(route => {
    const loc = (route.location || "").toLowerCase();
    if (LOCATIONS.includes(loc)) {
      routesByLocation[loc].push(route);
    }
  });
  const container = document.getElementById("dynamicRoutes");
  let html = "";
  LOCATIONS.forEach(loc => {
    if (!routesByLocation[loc].length) return;
    html += `<section class="city-block ${loc}">
      <h3>${LOCATION_LABELS[loc]}</h3>
      <div class="route-grid">`;
    routesByLocation[loc].forEach(route => {
      const stops = Array.isArray(route.stops) && route.stops.length
        ? route.stops.map(s => s.name).join(" → ")
        : "-";
        
      // Calculate seats
      const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
      const filledCount = bookings.filter(b => String(b.busNumber) === String(route.routeNumber || route.busNumber)).length;
      const capacity = route.seatsCapacity || 42;
      const available = Math.max(0, capacity - filledCount);
      
      html += `<article class="route-card">
        <h4>Route ${route.routeNumber || "-"} — ${route.busNumber || "-"}</h4>
        <p>${stops}</p>
        <span style="font-size: 0.9rem; color: #475569; font-weight: 500;">
          Seats: ${capacity} <span style="color:#64748b; font-weight: normal;">(${filledCount} Filled, <strong style="color: ${available > 0 ? '#16a34a' : '#dc2626'}">${available} Available</strong>)</span>
        </span>
      </article>`;
    });
    html += `</div></section>`;
  });
  container.innerHTML = html || '<p style="text-align:center;color:#64748b;">No routes available.</p>';
}

document.addEventListener("DOMContentLoaded", renderRoutes);
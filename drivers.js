import { getBusData, getDriverData } from "./storage.js";

function renderTableAndCards() {
  const tbody = document.querySelector(".status-table tbody");
  const cardsContainer = document.getElementById("driverCards");
  tbody.innerHTML = "";
  cardsContainer.innerHTML = "";

  const buses = getBusData();
  const drivers = getDriverData();

  if (!buses.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#64748b;">No buses/routes found.</td></tr>`;
    cardsContainer.innerHTML = `<p style='text-align:center;color:#64748b;'>No buses/routes found.</p>`;
    return;
  }

  buses.forEach(bus => {
    if (!bus.busNumber) return;
    let driverName = bus.driverName || "Unassigned";
    let driverContact = "-";
    if ((!bus.driverName || bus.driverName === "") && bus.driverId) {
      const driver = drivers.find(d => d.id === bus.driverId || d.id === Number(bus.driverId));
      if (driver) {
        driverName = driver.name;
        driverContact = driver.contact || "-";
      }
    } else if (bus.driverName) {
      // Try to find contact by name
      const driver = drivers.find(d => d.name === bus.driverName);
      if (driver) driverContact = driver.contact || "-";
    }
    const seatsLeft = (bus.seatsCapacity ?? 0) - (bus.seatsFilled ?? 0);
    tbody.innerHTML += `
      <tr>
        <td>${bus.busNumber}</td>
        <td>${bus.routeNumber || "-"}</td>
        <td>${driverName}</td>
        <td>${driverContact}</td>
        <td>${seatsLeft}</td>
      </tr>
    `;
    cardsContainer.innerHTML += `
      <div class="driver-card">
        <div><strong>Bus No.:</strong> ${bus.busNumber}</div>
        <div><strong>Route:</strong> ${bus.routeNumber || "-"}</div>
        <div><strong>Driver:</strong> ${driverName}</div>
        <div><strong>Contact:</strong> ${driverContact}</div>
        <div><strong>Seats Left:</strong> ${seatsLeft}</div>
      </div>
    `;
  });
}

function handleResponsiveView() {
  const table = document.querySelector(".status-table");
  const cards = document.getElementById("driverCards");
  if (window.innerWidth < 1000) {
    table.style.display = "none";
    cards.style.display = "block";
  } else {
    table.style.display = "table";
    cards.style.display = "none";
  }
}

window.addEventListener("resize", handleResponsiveView);
document.addEventListener("DOMContentLoaded", () => {
  renderTableAndCards();
  handleResponsiveView();
});

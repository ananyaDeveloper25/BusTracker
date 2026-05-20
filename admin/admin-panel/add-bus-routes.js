import { getBusData, saveBusData, getDriverData, saveDriverData } from "../../storage.js";

const user = localStorage.getItem("loggedInUser");

if (!user) {
  window.location.href = "../login.html";
}

/* ---------- INPUT REFERENCES ---------- */

const form = document.getElementById("addRouteForm");
const routeNumberInput = document.getElementById("routeNumber");
const busNumberInput = document.getElementById("busNumber");
const driverSelect = document.getElementById("driverSelect");
const seatsCapacityInput = document.getElementById("seatsCapacity");
const seatsFilledInput = document.getElementById("seatsFilled");
const routeLocationInput = document.getElementById("routeLocation");
const stopsList = document.getElementById("stopsList");
const addStopBtn = document.getElementById("addStopBtn");
const routeModal = document.getElementById("routeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalRouteDetails = document.getElementById("modalRouteDetails");

let editIndex = null;
let stops = [];

function renderStops() {
  if (!stopsList) return;
  stopsList.innerHTML = stops.map((stop, idx) => `
    <div class="stop-row" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
      <input type="text" placeholder="Stop Name" value="${stop.name}" data-idx="${idx}" class="stop-name" style="flex:1;" required />
      <input type="time" value="${stop.time}" data-idx="${idx}" class="stop-time" required />
      <button type="button" class="remove-stop-btn" data-idx="${idx}" style="color:#991b1b;background:#fee2e2;border:none;border-radius:6px;padding:2px 8px;">Remove</button>
    </div>
  `).join("");
}

if (addStopBtn) {
  addStopBtn.addEventListener("click", () => {
    stops.push({ name: "", time: "" });
    renderStops();
  });
}

if (stopsList) {
  stopsList.addEventListener("input", (e) => {
    const idx = e.target.dataset.idx;
    if (e.target.classList.contains("stop-name")) {
      stops[idx].name = e.target.value;
    } else if (e.target.classList.contains("stop-time")) {
      stops[idx].time = e.target.value;
    }
  });
  stopsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-stop-btn")) {
      const idx = e.target.dataset.idx;
      stops.splice(idx, 1);
      renderStops();
    }
  });
}

// Call this after page load to initialize
renderStops();
/* ---------- STORAGE ---------- */

function addBus(route) {
  const buses = getBusData();
  buses.push(route);
  saveBusData(buses);
}

function clearEditMode() {
  editIndex = null;
  form.querySelector("button[type='submit']").textContent = "Add Route";
}

function getAvailableDrivers() {
  return getDriverData().filter(driver => !driver.assigned);
}

function getDriverById(id) {
  return getDriverData().find(driver => driver.id === id);
}

function updateDriverAssignment(driverId, assigned) {
  const drivers = getDriverData();
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return;
  driver.assigned = assigned;
  saveDriverData(drivers);
}

function populateDriverSelect(selectedId = null) {
  const drivers = getAvailableDrivers();
  driverSelect.innerHTML = "<option value=''>Select driver</option>";

  drivers.forEach(driver => {
    const option = document.createElement("option");
    option.value = driver.id;
    option.textContent = `${driver.name} (${driver.license})`;
    driverSelect.appendChild(option);
  });

  if (selectedId !== null) {
    const selectedDriver = getDriverById(selectedId);
    if (selectedDriver && !drivers.some(dr => dr.id === selectedId)) {
      const selectedOption = document.createElement("option");
      selectedOption.value = selectedDriver.id;
      selectedOption.textContent = `${selectedDriver.name} (${selectedDriver.license})`;
      driverSelect.appendChild(selectedOption);
    }
    driverSelect.value = selectedId;
  }

  const hasDrivers = driverSelect.options.length > 1;
  driverSelect.disabled = !hasDrivers;

  const submitBtn = form.querySelector("button[type='submit']");

  if (!hasDrivers) {
    driverSelect.innerHTML = "<option value=''>No drivers available. Add drivers first.</option>";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.title = "You must add a driver first before creating a route";
    }
  } else {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
      submitBtn.title = "";
    }
  }
}

function setEditMode(index) {
  const buses = getBusData();
  const bus = buses[index];
  if (!bus) return;

  editIndex = index;
  routeNumberInput.value = bus.routeNumber || "";
  busNumberInput.value = bus.busNumber || "";
  populateDriverSelect(bus.driverId ?? null);
  seatsCapacityInput.value = "42";
  
  // Dynamically calculate seats filled
  const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  const filledCount = bookings.filter(b => String(b.busNumber) === String(bus.routeNumber || bus.busNumber)).length;
  seatsFilledInput.value = filledCount;

  if (routeLocationInput) routeLocationInput.value = bus.location || "";
  stops = Array.isArray(bus.stops) ? JSON.parse(JSON.stringify(bus.stops)) : [];
  renderStops();
  
  form.querySelector("button[type='submit']").textContent = "Update Route";
}

function deleteRoute(index) {
  const buses = getBusData();
  if (index < 0 || index >= buses.length) return;

  const removedRoute = buses.splice(index, 1)[0];
  saveBusData(buses);

  if (removedRoute && removedRoute.driverId) {
    updateDriverAssignment(Number(removedRoute.driverId), false);
  }

  if (editIndex === index) {
    clearEditMode();
    form.reset();
  }

  populateDriverSelect();
  renderMobileCards();
  renderBusTable();
}

function bindActionHandlers() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = Number(event.currentTarget.dataset.id);
      setEditMode(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = Number(event.currentTarget.dataset.id);
      deleteRoute(id);
    });
  });
}

/* ---------- UI RENDER ---------- */

function renderBusTable() {
  const tbody = document.querySelector("#busTable tbody");

  const buses = getBusData()
    .map((bus, idx) => ({ ...bus, originalIndex: idx }))
    .filter(bus => bus.routeNumber || bus.busNumber || bus.driverName);

  if (!buses.length) {
    tbody.innerHTML =
      `<tr>
        <td colspan="6" class="empty">No routes added yet</td>
      </tr>`;
    return;
  }

  let html = "";

  buses.forEach((bus) => {
    const driver = getDriverById(Number(bus.driverId));
    const driverLabel = driver ? `${driver.name} (${driver.license})` : (bus.driverName || "Unassigned");
    
    // Auto calculate seats filled for UI
    const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
    const filledCount = bookings.filter(b => String(b.busNumber) === String(bus.routeNumber || bus.busNumber)).length;

    html += `
      <tr class="route-row" data-index="${bus.originalIndex}" style="cursor:pointer;">
        <td>${bus.routeNumber || ""}</td>
        <td>${bus.busNumber || ""}</td>
        <td>${driverLabel}</td>
        <td>42</td>
        <td>${filledCount}</td>

        <td class="actions">
          <span class="edit-btn" data-id="${bus.originalIndex}">Edit</span>
          <span class="delete-btn" data-id="${bus.originalIndex}">Delete</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  bindActionHandlers();

  document.querySelectorAll(".route-row").forEach(row => {
    row.addEventListener("click", function(e) {
      if (e.target.classList.contains("edit-btn") || e.target.classList.contains("delete-btn")) return;
      const idx = Number(row.dataset.index);
      showRouteModal(idx);
    });
  });
}

function showRouteModal(index) {
  const buses = getBusData();
  const bus = buses[index];
  if (!bus) return;

  // Build stops HTML
  let stopsHtml = "";
  if (Array.isArray(bus.stops) && bus.stops.length > 0) {
    stopsHtml = `<ul style="padding-left:18px;">` +
      bus.stops.map(stop =>
        `<li><strong>${stop.name}</strong> <span style="color:#64748b;">(${stop.time})</span></li>`
      ).join("") +
      `</ul>`;
  } else {
    stopsHtml = "No stops listed";
  }

  // Get driver info
  const driver = getDriverById(Number(bus.driverId));
  const driverLabel = driver ? `${driver.name} (${driver.license})` : (bus.driverName || "Unassigned");

  // Auto calculate seats filled for UI
  const bookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
  const filledCount = bookings.filter(b => String(b.busNumber) === String(bus.routeNumber || bus.busNumber)).length;

  // Set modal content
  modalRouteDetails.innerHTML = `
    <h2 style="margin-bottom:10px;">Route ${bus.routeNumber || ""}</h2>
    <div><strong>Bus Number:</strong> ${bus.busNumber || "-"}</div>
    <div><strong>Driver:</strong> ${driverLabel}</div>
    <div><strong>Location:</strong> ${bus.location || "-"}</div>
    <div><strong>Capacity:</strong> 42</div>
    <div><strong>Seats Filled:</strong> ${filledCount}</div>
    <div style="margin-top:10px;"><strong>Stops:</strong> ${stopsHtml}</div>
  `;

  routeModal.style.display = "block";
}

// Modal close logic
if (closeModalBtn && routeModal) {
  closeModalBtn.addEventListener("click", () => {
    routeModal.style.display = "none";
  });
  // Optional: close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === routeModal) {
      routeModal.style.display = "none";
    }
  });
}

function renderMobileCards() {
  const container = document.getElementById("mobileCards");

  const buses = getBusData()
    .map((bus, idx) => ({ ...bus, originalIndex: idx }))
    .filter(bus =>
      bus.routeNumber ||
      bus.busNumber ||
      bus.driverName
    );

  if (!buses.length) {
    container.innerHTML = `
      <p style="text-align:center;color:#64748b;">
        No routes added yet
      </p>`;
    return;
  }

  let html = "";

  buses.forEach((bus) => {
  html += `
    <div class="route-card">

      <div class="card-actions">
        <span class="edit-btn" data-id="${bus.originalIndex}">Edit</span>
        <span class="delete-btn" data-id="${bus.originalIndex}">Delete</span>
      </div>

      <h3>Route ${bus.routeNumber || "-"}</h3>

      <div class="card-row">
        <span class="card-label">Bus No.</span>
        <span class="card-value">${bus.busNumber || "-"}</span>
      </div>

      <div class="card-row">
        <span class="card-label">Driver</span>
        <span class="card-value">${getDriverById(Number(bus.driverId))?.name || bus.driverName || "-"}</span>
      </div>

      <div class="card-row">
        <span class="card-label">Capacity</span>
        <span class="card-value">${bus.seatsCapacity ?? "-"}</span>
      </div>

      <div class="card-row">
        <span class="card-label">Seats Filled</span>
        <span class="card-value">${bus.seatsFilled ?? 0}</span>
      </div>

    </div>
  `;
});

  container.innerHTML = html;
  bindActionHandlers();
}

/* ---------- FORM SUBMIT ---------- */

form.addEventListener("submit", e => {
  e.preventDefault();

  const route = {
    routeNumber: routeNumberInput.value.trim(),
    busNumber: busNumberInput.value.trim(),
    driverId: Number(driverSelect.value) || null,
    seatsCapacity: Number(seatsCapacityInput.value),
    seatsFilled: Number(seatsFilledInput.value) || 0,
    location: routeLocationInput.value.trim(),
    stops: stops.map(stop => ({ ...stop }))
    };

  const buses = getBusData();

  if (editIndex !== null && editIndex >= 0 && editIndex < buses.length) {
    const currentRoute = buses[editIndex];
    if (currentRoute.driverId && currentRoute.driverId !== route.driverId) {
      updateDriverAssignment(Number(currentRoute.driverId), false);
    }

    if (route.driverId) {
      updateDriverAssignment(Number(route.driverId), true);
    }

    buses[editIndex] = route;
    saveBusData(buses);
    clearEditMode();
  } else {
    if (route.driverId) {
      updateDriverAssignment(Number(route.driverId), true);
    }
    addBus(route);
  }

  renderBusTable();
  renderMobileCards();
  form.reset();
  clearEditMode();
  populateDriverSelect();
  stops = [];
  renderStops();
});

/* ---------- INITIAL LOAD ---------- */

populateDriverSelect();
renderMobileCards();
renderBusTable();
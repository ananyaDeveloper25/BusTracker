import { getDriverData, saveDriverData } from "../../storage.js";

const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "../login.html";
}

const form = document.getElementById("addDriverForm");
const driverNameInput = document.getElementById("driverName");
const licenseNumberInput = document.getElementById("licenseNumber");
const ageInput = document.getElementById("age");
const bloodGroupInput = document.getElementById("bloodGroup");
const contactNumberInput = document.getElementById("contactNumber");
const driverUsernameInput = document.getElementById("driverUsername");
const driverPasswordInput = document.getElementById("driverPassword");

let editIndex = null;

function addDriver(driver) {
  const drivers = getDriverData();
  drivers.push(driver);
  saveDriverData(drivers);
}

function clearEditMode() {
  editIndex = null;
  form.querySelector("button[type='submit']").textContent = "Add Driver";
  if (driverPasswordInput) driverPasswordInput.required = true;
}

function setEditMode(index) {
  const drivers = getDriverData();
  const driver = drivers[index];
  if (!driver) return;

  editIndex = index;
  driverNameInput.value = driver.name;
  licenseNumberInput.value = driver.license;
  ageInput.value = driver.age;
  bloodGroupInput.value = driver.bloodGroup;
  contactNumberInput.value = driver.contact;
  if (driverUsernameInput) driverUsernameInput.value = driver.username || "";
  // Don't pre-fill password for security; blank = keep existing
  if (driverPasswordInput) driverPasswordInput.value = "";
  if (driverPasswordInput) driverPasswordInput.required = false;

  form.querySelector("button[type='submit']").textContent = "Update Driver";
}

function deleteDriver(index) {
  const drivers = getDriverData();
  drivers.splice(index, 1);
  saveDriverData(drivers);
  clearEditMode();
  form.reset();
  renderDriverTable();
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
      deleteDriver(id);
    });
  });
}

function renderDriverTable() {
  const tbody = document.querySelector("#driverTable tbody");
  const drivers = getDriverData();

  if (!drivers.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty">No drivers added yet</td>
      </tr>`;
    return;
  }

  let html = "";

  drivers.forEach((driver, index) => {
    html += `
      <tr>
        <td>${driver.name}</td>
        <td>${driver.license}</td>
        <td>${driver.age}</td>
        <td>${driver.bloodGroup}</td>
        <td>${driver.contact}</td>
        <td>${driver.assigned ? "Assigned" : "Available"}</td>
        <td class="actions">
          <span class="edit-btn" data-id="${index}">Edit</span>
          <span class="delete-btn" data-id="${index}">Delete</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  bindActionHandlers();
}

function renderMobileDriverCards() {
  const container = document.getElementById("mobileDriverCards");

  const drivers = getDriverData();

  if (!drivers.length) {
    container.innerHTML = `
      <p style="text-align:center;color:#64748b;">
        No drivers added yet
      </p>`;
    return;
  }

  let html = "";

  drivers.forEach((driver, index) => {
    html += `
      <div class="route-card">
        <div class="card-actions">
          <span class="edit-btn" data-id="${index}">Edit</span>
          <span class="delete-btn" data-id="${index}">Delete</span>
        </div>
        <h3>${driver.name}</h3>
        <div class="card-row">
          <span class="card-label">License</span>
          <span class="card-value">${driver.license}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Age</span>
          <span class="card-value">${driver.age}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Blood Group</span>
          <span class="card-value">${driver.bloodGroup}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Contact</span>
          <span class="card-value">${driver.contact}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Status</span>
          <span class="card-value">${driver.assigned ? "Assigned" : "Available"}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  bindActionHandlers();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newDriver = {
    id: Date.now(),
    name: driverNameInput.value.trim(),
    license: licenseNumberInput.value.trim(),
    age: Number(ageInput.value),
    bloodGroup: bloodGroupInput.value.trim(),
    contact: contactNumberInput.value.trim(),
    username: driverUsernameInput ? driverUsernameInput.value.trim() : "",
    password: driverPasswordInput ? driverPasswordInput.value.trim() : "",
    assigned: false
  };

  const drivers = getDriverData();

  if (editIndex !== null && editIndex >= 0 && editIndex < drivers.length) {
    newDriver.id = drivers[editIndex].id;
    newDriver.assigned = drivers[editIndex].assigned;
    // If password left blank during edit, keep existing password
    if (!newDriver.password) {
      newDriver.password = drivers[editIndex].password || "";
    }
    drivers[editIndex] = newDriver;
    saveDriverData(drivers);
    clearEditMode();
  } else {
    addDriver(newDriver);
  }

  renderDriverTable();
  renderMobileDriverCards();
  form.reset();
});

renderMobileDriverCards();
renderDriverTable();
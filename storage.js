if (!localStorage.getItem("busData")) {
  localStorage.setItem("busData", JSON.stringify([]));
}

if (!localStorage.getItem("driverData")) {
  localStorage.setItem("driverData", JSON.stringify([]));
}

if (!localStorage.getItem("complaintData")) {
  localStorage.setItem("complaintData", JSON.stringify([]));
}

if (!localStorage.getItem("clientData")) {
  localStorage.setItem("clientData", JSON.stringify([]));
}

if (!localStorage.getItem("clientBookings")) {
  localStorage.setItem("clientBookings", JSON.stringify([]));
}

if (!localStorage.getItem("loggedInClient")) {
  localStorage.setItem("loggedInClient", JSON.stringify(null));
}

export function getBusData() {
  return JSON.parse(localStorage.getItem("busData")) || [];
}

export function saveBusData(buses) {
  localStorage.setItem("busData", JSON.stringify(buses));
}

export function getDriverData() {
  return JSON.parse(localStorage.getItem("driverData")) || [];
}

export function saveDriverData(drivers) {
  localStorage.setItem("driverData", JSON.stringify(drivers));
}

export function getComplaintData() {
  return JSON.parse(localStorage.getItem("complaintData")) || [];
}

export function saveComplaintData(complaints) {
  localStorage.setItem("complaintData", JSON.stringify(complaints));
}

export function getClientData() {
  return JSON.parse(localStorage.getItem("clientData")) || [];
}

export function saveClientData(clients) {
  localStorage.setItem("clientData", JSON.stringify(clients));
}

export function getClientBookings() {
  return JSON.parse(localStorage.getItem("clientBookings")) || [];
}

export function saveClientBookings(bookings) {
  localStorage.setItem("clientBookings", JSON.stringify(bookings));
}

export function getLoggedInClient() {
  return JSON.parse(localStorage.getItem("loggedInClient"));
}

export function setLoggedInClient(client) {
  localStorage.setItem("loggedInClient", JSON.stringify(client));
}

export function clearLoggedInClient() {
  localStorage.setItem("loggedInClient", JSON.stringify(null));
}
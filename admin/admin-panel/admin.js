const user = localStorage.getItem("loggedInUser");
const parsedUser = user ? JSON.parse(user) : null;

if (!parsedUser) {
  window.location.href = "../login.html";
} else if (parsedUser.role === "driver") {
  // Drivers should not access admin panel — redirect to driver panel
  window.location.href = "../driver-panel/driver.html";
}

function updateBusSeats(busNumber, seatsFilled) {
  const bus = busData.find(b => b.busNumber === busNumber);
  if (bus) {
    bus.seatsFilled = seatsFilled;
  }
}

function updateStopStatus(busNumber, stopName, status) {
  const bus = busData.find(b => b.busNumber === busNumber);
  if (bus) {
    const stop = bus.stops.find(s => s.name === stopName);
    if (stop) stop.status = status;
  }
}

function addComplaint(complaint) {
  complaints.push(complaint);
}

function addPayment(payment) {
  payments.push(payment);
}
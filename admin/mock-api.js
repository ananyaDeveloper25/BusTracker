const defaultBusData = [
  {
    routeNumber: "",
    busNumber: "",
    driverName: "",
    seatsCapacity:"",
    seatsFilled:"",
    stops: []
  }
];

// initialize storage if empty
if (!localStorage.getItem("busData")) {
  localStorage.setItem("busData", JSON.stringify(defaultBusData));
}


// ===== API FUNCTIONS =====

function getBusData() {
  return JSON.parse(localStorage.getItem("busData")) || [];
}

function saveBusData(data) {
  localStorage.setItem("busData", JSON.stringify(data));
}

function addBus(route) {
  const buses = getBusData();
  buses.push(route);
  saveBusData(buses);
}

const complaints = [];
const payments = [];
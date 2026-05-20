document.addEventListener("DOMContentLoaded", function () {
    const data = JSON.parse(localStorage.getItem("bookingData"));

    const userDiv = document.getElementById("userData");

    if (data && userDiv) {
        userDiv.innerHTML = `
            <h3>Booking Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Route City:</strong> ${data.routeCity}</p>
            <p><strong>Roll No:</strong> ${data.roll}</p>
            <p><strong>Degree:</strong> ${data.degree}</p>
            <p><strong>End Year:</strong> ${data.gradYear}</p>
            <p><strong>Payment Method:</strong> ${data.payment}</p>
        `;
    } else if (!data) {
        alert("No booking found. Redirecting...");
        window.location.href = "booking.html";
    }
});

function confirmPayment() {
    const data = JSON.parse(localStorage.getItem("bookingData"));
    if (data) {
        const existingBookings = JSON.parse(localStorage.getItem("clientBookings")) || [];
        existingBookings.push(data);
        localStorage.setItem("clientBookings", JSON.stringify(existingBookings));
    }
    // Clear temporary data
    localStorage.removeItem("bookingData");
    window.location.href = "payment-success.html";
}
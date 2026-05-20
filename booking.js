// Auth guard — redirect to login if not signed in
document.addEventListener("DOMContentLoaded", function() {
    const loggedInClient = JSON.parse(localStorage.getItem("loggedInClient"));
    if (!loggedInClient) {
        // Store intended destination so we can redirect back after login
        sessionStorage.setItem("redirectAfterLogin", "booking.html");
        window.location.href = "client-signin.html";
        return;
    }

    // Pre-populate all fields from signup data
    const fields = {
        name: loggedInClient.fullName || loggedInClient.name || "",
        email: loggedInClient.email || "",
        contact: loggedInClient.contact || loggedInClient.phone || "",
        address: loggedInClient.address || "",
        roll: loggedInClient.rollNumber || loggedInClient.roll || "",
        degree: loggedInClient.degreeName || loggedInClient.degree || "",
        gradYear: loggedInClient.yearEnd || loggedInClient.gradYear || loggedInClient.yearStart || ""
    };

    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && value) el.value = value;
    });

    // Set routeCity if available
    if (loggedInClient.routeCity) {
        const routeCity = document.getElementById("routeCity");
        if (routeCity) routeCity.value = loggedInClient.routeCity;
    }
});

document.getElementById("bookingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const loggedInClient = JSON.parse(localStorage.getItem("loggedInClient"));

    const data = {
        id: Date.now(),
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        contact: document.getElementById("contact").value,
        address: document.getElementById("address").value,
        routeCity: document.getElementById("routeCity").value,
        roll: document.getElementById("roll").value,
        degree: document.getElementById("degree").value,
        gradYear: document.getElementById("gradYear").value,
        payment: document.querySelector('input[name="payment"]:checked').value,
        clientId: loggedInClient ? loggedInClient.id : null,
        createdAt: new Date().toISOString()
    };

    // Save temporary booking data for the review payment page
    localStorage.setItem("bookingData", JSON.stringify(data));

    window.location.href = "review-payment.html";
});
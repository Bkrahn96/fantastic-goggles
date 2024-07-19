document.getElementById('findRestaurant').onclick = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `/.netlify/functions/getRestaurants?lat=${lat}&lon=${lon}`;

            showLoadingIndicator();

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log('API Response:', data); // Remove or comment out after debugging
                displayResults(data, lat, lon);
            } catch (error) {
                console.error('Error fetching data:', error);
                displayError('Failed to fetch restaurant data. Please try again later.');
            } finally {
                hideLoadingIndicator();
            }
        }, handleGeolocationError);
    } else {
        displayError('Geolocation is not supported by this browser.');
    }
};

const handleGeolocationError = (error) => {
    let message;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'User denied the request for Geolocation. Please enable location services and try again.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again later.';
            break;
        case error.TIMEOUT:
            message = 'The request to get user location timed out. Please try again.';
            break;
        default:
            message = 'An unknown error occurred. Please try again.';
            break;
    }
    displayError(message);
    console.error('Geolocation error:', error);
};

const displayResults = (data, lat, lon) => {
    const results = document.getElementById('results');
    results.innerHTML = '';
    if (data.results && data.results.length > 0) {
        data.results.slice(0, 3).forEach(restaurant => {
            const div = document.createElement('div');
            const distance = calculateDistance(lat, lon, restaurant.geometry.location.lat, restaurant.geometry.location.lng);
            const types = restaurant.types ? restaurant.types.join(', ') : 'N/A';
            const openingHours = restaurant.opening_hours ? (restaurant.opening_hours.open_now ? 'Open Now' : 'Closed') : 'N/A';
            div.innerHTML = `
                <h2>${restaurant.name}</h2>
                <p>Address: ${restaurant.vicinity}</p>
                <p>Type: ${types}</p>
                <p>Distance: ${distance.toFixed(2)} miles</p>
                <p>Rating: ${restaurant.rating || 'N/A'}</p>
                <p>Opening Hours: ${openingHours}</p>
            `;
            results.appendChild(div);
        });
    } else {
        results.innerHTML = '<p>No restaurants found.</p>';
    }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;

    return R * 2 * Math.asin(Math.sqrt(a));
};

const showLoadingIndicator = () => {
    const results = document.getElementById('results');
    results.innerHTML = '<p>Loading...</p>';
};

const hideLoadingIndicator = () => {
    const results = document.getElementById('results');
    results.innerHTML = '';
};

const displayError = (message) => {
    const results = document.getElementById('results');
    results.innerHTML = `<p>${message}</p>`;
    alert(message);
};

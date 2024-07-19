document.getElementById('findRestaurant').onclick = function() {
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    
    if (navigator.geolocation) {
        loading.style.display = 'block';
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `/.netlify/functions/getRestaurants?lat=${lat}&lon=${lon}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('API Response:', data); // Log the API response
                    results.innerHTML = '';
                    loading.style.display = 'none';
                    if (data.results && data.results.length > 0) {
                        // Show only the first 3 results
                        data.results.slice(0, 3).forEach(restaurant => {
                            const div = document.createElement('div');
                            const distance = calculateDistance(lat, lon, restaurant.geometry.location.lat, restaurant.geometry.location.lng);
                            const types = restaurant.types ? restaurant.types.join(', ') : 'N/A';
                            div.innerHTML = `
                                <h2>${restaurant.name}</h2>
                                <p>Address: ${restaurant.vicinity}</p>
                                <p>Type: ${types}</p>
                                <p>Distance: ${distance.toFixed(2)} miles</p>
                                <p>Rating: ${restaurant.rating || 'N/A'}</p>
                            `;
                            results.appendChild(div);
                        });
                    } else {
                        results.innerHTML = '<p>No restaurants found.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    results.innerHTML = '<p>Failed to fetch restaurant data. Please try again later.</p>';
                    loading.style.display = 'none';
                });
        }, function(error) {
            loading.style.display = 'none';
            handleGeolocationError(error);
        });
    } else {
        results.innerHTML = '<p>Geolocation is not supported by this browser.</p>';
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

function handleGeolocationError(error) {
    const results = document.getElementById('results');
    switch(error.code) {
        case error.PERMISSION_DENIED:
            results.innerHTML = '<p>User denied the request for Geolocation.</p>';
            break;
        case error.POSITION_UNAVAILABLE:
            results.innerHTML = '<p>Location information is unavailable.</p>';
            break;
        case error.TIMEOUT:
            results.innerHTML = '<p>The request to get user location timed out.</p>';
            break;
        case error.UNKNOWN_ERROR:
            results.innerHTML = '<p>An unknown error occurred.</p>';
            break;
    }
    alert('Geolocation error. Please check your browser settings and try again.');
}

// Set default slider values based on current time
window.onload = function() {
    const mealTimeSlider = document.getElementById('mealTimeSlider');
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 11) {
        mealTimeSlider.value = 0; // Breakfast
    } else if (currentHour >= 11 && currentHour < 17) {
        mealTimeSlider.value = 1; // Lunch
    } else if (currentHour >= 17 && currentHour < 22) {
        mealTimeSlider.value = 2; // Dinner
    } else {
        mealTimeSlider.value = 1; // Default to Lunch
    }
};

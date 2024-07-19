document.getElementById('findRestaurant').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `/.netlify/functions/getRestaurants?lat=${lat}&lon=${lon}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('API Response:', data); // Log the API response
                    const results = document.getElementById('results');
                    results.innerHTML = '';
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
                .catch(error => console.error('Error fetching data:', error));
        }, function(error) {
            console.error('Geolocation error:', error);
            const results = document.getElementById('results');
            results.innerHTML = '<p>No location provided.</p>';
            alert('No location provided. Please reset your browser location settings and try again.');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        const results = document.getElementById('results');
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

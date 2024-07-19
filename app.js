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
                            div.innerHTML = `
                                <h2>${restaurant.name}</h2>
                                <p>Address: ${restaurant.vicinity}</p>
                                <p>Type: ${restaurant.types ? restaurant.types.join(', ') : 'N/A'}</p>
                                <p>Rating: ${restaurant.rating ? restaurant.rating : 'N/A'}</p>
                                <p>Distance: ${(calculateDistance(lat, lon, restaurant.geometry.location.lat, restaurant.geometry.location.lng)).toFixed(2)} miles</p>
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
    const rlat1 = lat1 * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = lat2 * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon = (lon2 - lon1) * (Math.PI / 180); // Radian difference (longitudes)

    const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) +
        Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}

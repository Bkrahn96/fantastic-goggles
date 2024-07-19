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
                        data.results.forEach(restaurant => {
                            const div = document.createElement('div');
                            div.innerHTML = `<h2>${restaurant.name}</h2><p>${restaurant.vicinity}</p>`;
                            results.appendChild(div);
                        });
                    } else {
                        results.innerHTML = '<p>No restaurants found.</p>';
                        console.log('No restaurants found in the API response.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    const results = document.getElementById('results');
                    results.innerHTML = '<p>Error fetching data. Please try again later.</p>';
                });
        }, function(error) {
            const results = document.getElementById('results');
            results.innerHTML = `<p>No location provided. Please reset your browser's location settings.</p>
                                 <button id="resetLocation">Reset Location Settings</button>`;
            document.getElementById('resetLocation').onclick = function() {
                alert("To reset your browser's location settings, please follow these steps:\n1. Go to your browser settings.\n2. Find the privacy and security settings.\n3. Look for location settings.\n4. Reset or clear the location settings.");
            };
            console.error('Geolocation error:', error);
        });
    } else {
        const results = document.getElementById('results');
        results.innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
        console.error('Geolocation is not supported by this browser.');
    }
};

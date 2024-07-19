document.getElementById('findRestaurant').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = 'AIzaSyAQOuogIYyjxwC1VtkoCSzuA6IHyRVFxlI';
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('API Response:', data); // Add this line to log the response
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
                    }
                })
                .catch(error => console.error('Error fetching data:', error));
        }, function(error) {
            console.error('Geolocation error:', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
};

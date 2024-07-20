document.getElementById('findRestaurant').onclick = function() {
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const loadMoreButton = document.getElementById('loadMore');

    if (navigator.geolocation) {
        loading.style.display = 'block';
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            userCoordinates = { lat, lon };
            const restaurantType = document.getElementById('restaurantTypeSlider').value;
            const url = `/.netlify/functions/getRestaurants?lat=${lat}&lon=${lon}&type=${restaurantType}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('API Response:', data); // Log the API response
                    currentResults = data.results || [];
                    currentIndex = 0;
                    results.innerHTML = '';
                    loading.style.display = 'none';
                    loadMoreButton.style.display = currentResults.length > RESULTS_PER_PAGE ? 'block' : 'none';
                    const newElements = displayNextResults();
                    if (newElements.length > 0) {
                        newElements[0].scrollIntoView({ behavior: 'smooth' });
                    }
                    sendHeight();
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    results.innerHTML = '<p>Failed to fetch restaurant data. Please try again later.</p>';
                    loading.style.display = 'none';
                    sendHeight();
                });
        }, function(error) {
            loading.style.display = 'none';
            handleGeolocationError(error);
            sendHeight();
        });
    } else {
        results.innerHTML = '<p>Geolocation is not supported by this browser.</p>';
        sendHeight();
    }
};

document.getElementById('loadMore').onclick = function() {
    const newElements = displayNextResults();
    if (newElements.length > 0) {
        newElements[0].scrollIntoView({ behavior: 'smooth' });
    }
    sendHeight();
};

function displayNextResults() {
    const results = document.getElementById('results');
    const loadMoreButton = document.getElementById('loadMore');
    const nextResults = currentResults.slice(currentIndex, currentIndex + RESULTS_PER_PAGE);

    const newElements = [];

    nextResults.forEach(restaurant => {
        const div = document.createElement('div');
        const distance = calculateDistance(
            userCoordinates.lat, 
            userCoordinates.lon, 
            restaurant.geometry.location.lat, 
            restaurant.geometry.location.lng
        );
        const types = restaurant.types ? restaurant.types.join(', ') : 'N/A';
        const chainNote = restaurant.chainCount > 1 ? '<p>Note: This is the closest location, but there are multiple locations nearby not shown in the search results.</p>' : '';
        div.innerHTML = `
            <h2>${restaurant.name}</h2>
            <p>Address: ${restaurant.vicinity}</p>
            <p>Type: ${types}</p>
            <p>Distance: ${distance.toFixed(2)} miles</p>
            <p>Rating: ${restaurant.rating || 'N/A'}</p>
            ${chainNote}
        `;
        results.appendChild(div);
        newElements.push(div);
    });

    currentIndex += RESULTS_PER_PAGE;
    if (currentIndex >= currentResults.length) {
        loadMoreButton.style.display = 'none';
    }

    return newElements;
}

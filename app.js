document.getElementById('findRestaurant').onclick = function() {
    const url = `/.netlify/functions/getRestaurantsProxy`;

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
            }
        })
        .catch(error => console.error('Error fetching data:', error));
};

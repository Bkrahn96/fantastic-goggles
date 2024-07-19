const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon } = event.queryStringParameters;
    const apiKey = 'AIzaSyAQOuogIYyjxwC1VtkoCSzuA6IHyRVFxlI';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};

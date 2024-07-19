const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, type } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_API_KEY;
    let keyword;

    switch(type) {
        case '0':
            keyword = 'fast_food';
            break;
        case '1':
            keyword = 'restaurant|bar';
            break;
        case '2':
            keyword = 'fine_dining';
            break;
        default:
            keyword = 'restaurant';
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=${keyword}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};

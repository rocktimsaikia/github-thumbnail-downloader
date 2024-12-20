const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async function (event, context) {
	// Enable CORS
	const headers = {
		"Access-Control-Allow-Origin":
			"https://github-thumbnail-downloader.netlify.app",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "GET",
	};

	// Handle preflight OPTIONS request
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers,
		};
	}

	try {
		const { url } = event.queryStringParameters;

		if (!url) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: "URL parameter is required" }),
			};
		}

		// Fetch the HTML content
		const response = await axios.get(url);
		const html = response.data;

		// Parse HTML and extract twitter:image
		const $ = cheerio.load(html);
		const twitterImage = $('meta[name="twitter:image"]').attr("content");

		if (!twitterImage) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ error: "Twitter image not found" }),
			};
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ imageUrl: twitterImage }),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

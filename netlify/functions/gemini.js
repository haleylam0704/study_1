const fetch = require('node-fetch');
// We need the 'Response' class from node-fetch to construct our streaming response
const { Response } = require('node-fetch'); 

exports.handler = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiApiUrl = `https://generativela..googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}&alt=sse`;

  try {
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error:", errorText);
      // Return a standard error response object
      return {
        statusCode: geminiResponse.status,
        body: `Error from Gemini API: ${errorText}`,
      };
    }

    // THIS IS THE KEY CHANGE:
    // Instead of returning a custom object with a stream in the .body property,
    // we return a standard `Response` object. Netlify's runtime understands
    // how to handle this for streaming.
    return new Response(geminiResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};

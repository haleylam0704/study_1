const fetch = require('node-fetch');

exports.handler = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}&alt=sse`;

  try {
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error:", errorText);
      return {
        statusCode: geminiResponse.status,
        body: `Error from Gemini API: ${errorText}`,
      };
    }

    // THIS IS THE KEY CHANGE:
    // We return a simple object again, but with the addition of
    // `isBase64Encoded: false`. This tells the underlying system
    // (AWS Lambda) how to handle the body, which is a stream.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
      body: geminiResponse.body,
      isBase64Encoded: false, // <-- Add this line
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};

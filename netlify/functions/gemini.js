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

    // THIS IS THE CRITICAL SECTION
    // 1. `geminiResponse.body` is a Node.js-style stream.
    // 2. We create a new, web-standard `ReadableStream`.
    // 3. We pipe the data from the Node stream into our new standard stream.
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of geminiResponse.body) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    // 4. We return a standard `Response` object containing our converted stream.
    //    This is the format Netlify's runtime understands for streaming.
    return new Response(readableStream, {
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

// This is the final, corrected version of the secure "middleman" function.
// It uses a ReadableStream to ensure full compatibility with Netlify's streaming response requirements.
// **Crucially, it uses node-fetch v2 for stability.**

const fetch = require('node-fetch'); // <-- THE KEY CHANGE IS HERE

exports.handler = async (event) => {
  // Get the secret API key from the environment variables you set in Netlify
  const apiKey = process.env.GEMINI_API_KEY;

  // The real Gemini API endpoint for streaming
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}&alt=sse`;

  try {
    // Forward the user's request (the chat history) to the real Gemini API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body, // Pass along the chat history from the user's request
    });

    // If the request to Gemini fails, return an error
    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API Error:", errorText);
        return {
            statusCode: geminiResponse.status,
            body: `Error from Gemini API: ${errorText}`,
        };
    }

    // Create a new ReadableStream to pipe the response through.
    // This is the key that makes it compatible with Netlify.
    const readableStream = new ReadableStream({
      async start(controller) {
        // Node-fetch's body is already a stream, so we can iterate it directly
        for await (const chunk of geminiResponse.body) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });
    
    // Return the stream to Netlify
    return {
      statusCode: 200,
      body: readableStream,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};

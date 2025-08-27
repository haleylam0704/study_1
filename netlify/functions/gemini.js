// This is the final, corrected version of the secure "middleman" function.
// It's specifically designed to handle streaming responses correctly on Netlify.

export const handler = async (event) => {
  // Get the secret API key from the environment variables you set in Netlify
  const apiKey = process.env.GEMINI_API_KEY;
  
  // The real Gemini API endpoint for streaming
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:streamGenerateContent?key=${apiKey}`;

  try {
    // Forward the user's request (the chat history) to the real Gemini API
    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body, // Pass along the chat history from the user's request
    });

    // If the request to Gemini fails, return an error
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        return {
            statusCode: response.status,
            body: `Error from Gemini API: ${errorText}`,
        };
    }

    // This is the key part for streaming with Netlify.
    // It returns the streaming body directly to the user's browser.
    return {
      statusCode: 200,
      body: response.body,
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

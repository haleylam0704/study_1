// netlify/edge-functions/gemini.js

export default async (request, context) => {
  // Get the secret API key from environment variables
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}&alt=sse`;

  try {
    // Get the user's chat history from the incoming request body
    const requestBody = await request.text();

    // Forward the request to the real Gemini API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    // If the request to Gemini fails, return an error
    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API Error:", errorText);
        return new Response(`Error from Gemini API: ${errorText}`, { status: geminiResponse.status });
    }

    // This is the key. Edge Functions can stream a Response object perfectly.
    // We just take the body stream from Gemini's response and put it in our new response.
    return new Response(geminiResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in Edge function:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred.' }), { status: 500 });
  }
};

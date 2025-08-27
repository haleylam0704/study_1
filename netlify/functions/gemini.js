{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\partightenfactor0

\f0\fs26 \cf0 // This is your secure "middleman" function.\
// It runs on Netlify's servers, not in the user's browser.\
\
// The handler function that Netlify will run\
exports.handler = async function(event, context) \{\
  // Get the secret API key from the environment variables you set in Netlify\
  const apiKey = process.env.GEMINI_API_KEY;\
  \
  // The real Gemini API endpoint\
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:streamGenerateContent?key=$\{apiKey\}`;\
\
  try \{\
    // Forward the user's request (the chat history) to the real Gemini API\
    const response = await fetch(geminiApiUrl, \{\
      method: 'POST',\
      headers: \{\
        'Content-Type': 'application/json',\
      \},\
      body: event.body, // Pass along the chat history from the user's request\
    \});\
\
    // If the request to Gemini fails, return an error\
    if (!response.ok) \{\
      return \{\
        statusCode: response.status,\
        body: `Error from Gemini API: $\{await response.text()\}`,\
      \};\
    \}\
\
    // Return the streaming response from Gemini directly back to the user's browser\
    return \{\
      statusCode: 200,\
      headers: \{\
        'Content-Type': 'text/event-stream',\
      \},\
      body: response.body,\
    \};\
\
  \} catch (error) \{\
    console.error('Error in Netlify function:', error);\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: 'An internal error occurred.' \}),\
    \};\
  \}\
\};\
\
}
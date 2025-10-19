## Mission Briefing: Phase 1 - The Handshake

The Objective:
Your goal is to make a "Login with Spotify" button. When a user clicks it, their browser should be redirected to the official Spotify authorization page.

The Intel (What you need to know):
This is the first step of the OAuth 2.0 flow. We are not actually logging the user in yet. We are just sending them to Spotify with a "request" for permission. This request is built into a special URL.

The Equipment (Your tools & ingredients):
You have everything you need in your App.jsx file and your .env.local file.

A <button> element.

An onClick event handler for that button.

Your Spotify Client ID (import.meta.env.VITE_SPOTIFY_CLIENT_ID).

The Redirect URI string: 'http://localhost:5173'.

The Scopes string: 'playlist-modify-public playlist-modify-private'.




<!-- after redirection to spotify -->
What Just Happened:
✅ You built the authorization URL correctly
✅ Browser redirected to Spotify
✅ Spotify is showing the permission screen
What Will Happen Next:
When you click "Agree", Spotify will:

Redirect you back to http://127.0.0.1:5173/callback
Add a code parameter to the URL (this is the authorization code)
The URL will look like: http://127.0.0.1:5173/callback?code=AQD...
Your Next Challenge:
After you click "Agree", you'll land on a blank page (because /callback route doesn't exist yet).


## serverless fucntions
Your Next Steps - Think About This:
Step 1: Capture the Code (Frontend)
You need to:

Read the URL parameter code from the current page
Send this code to your backend
Question for you: Do you know how to read URL parameters in JavaScript? (Hint: There's a built-in URLSearchParams API)

Step 2: Create a Backend Function (Serverless)
You'll create a serverless function that:

Receives the code from frontend
Uses code + client_secret to get access token from Spotify
Sends the access token back to frontend

its main task is to take the code from the frontend and exchange it with the spotify api for access-token
and then sends the token back to react app





<!-- upar bhi bahut imporant stuff likhnah ahi bhai so do that too  -->

Now Let's Create the Serverless Function!
You mentioned you created callback.js. Before we write the code, let me explain the structure.

Understanding Serverless Functions in Vercel:
Location: Files in api folder become API endpoints
Structure: Each function exports a handler that receives request and response
Your function will:
Receive the code from frontend
Exchange it with Spotify for an access token
Send the token back to frontend
What You Need to Do in callback.js:
Extract the code from the request body
Make a POST request to Spotify's token endpoint
Send required data: client_id, client_secret, code, redirect_uri, grant_type
Get the access token from Spotify's response
Send it back to the frontend



phase 2: gemini integration



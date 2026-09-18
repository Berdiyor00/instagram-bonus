# Instagram Bonus Demo

This is a lightweight static website inspired by Instagram registration flow.

## Features
- Registration and login mock UI based on Instagram style
- Bonus claim form with 10K followers campaign text
- Shared backend storage for cross-device registration visibility
- Browser localStorage fallback for same-browser persistence
- Simple admin page to view records and export JSON
- Works locally with a small Node server

## Run locally
Install dependencies and start the server:

```bash
npm install
node server.js
```

Then open:
- http://localhost:3000
- http://localhost:3000/admin

## Deploy to a public host
This project is designed to work when the data is served by a single shared backend. Static Vercel hosting alone cannot keep shared data between different devices because browser localStorage is private to each browser.

Use a host with Node support such as Render, Railway, or a Vercel serverless function with a real database.

## Important note
For true multi-user admin visibility from different phones/computers, a shared backend or database is required. This app uses a shared JSON API when running from a server, and falls back to localStorage when no server is available.

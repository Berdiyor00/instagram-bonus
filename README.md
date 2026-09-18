# Instagram Bonus Demo

This is a lightweight static website inspired by Instagram registration flow.

## Features
- Registration and login mock UI based on Instagram style
- Bonus claim form with 10K followers campaign text
- Data saved to browser localStorage for persistence in the same browser/device
- Simple admin page to view records and export JSON
- Works on Vercel as a static site

## Run locally
Open the project folder and start a static server:

```bash
python -m http.server 8000
```

Then open:
- http://localhost:8000
- http://localhost:8000/admin.html

## Deploy to Vercel
1. Push the project to your GitHub repository.
2. Import the repo in Vercel.
3. Use the default settings for a static site.
4. Deploy.

## Important note
LocalStorage is stored in the browser, so it stays on the same browser/device. It does not sync across different users/devices automatically. For true multi-user sharing, a backend database and server are required.

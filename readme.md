# Websearch API powered by Lilypad

This is a demo project showcasing the power of the Lilypad Anura API.  This project combines websearch and AI powered answers using Anura to help answer questions based on the latest happenings provided as context.  The project is an express application with a vanilla frontend meant only for demonstration purposes.

Technologies used:
- Node.js
- Express
- Anura API
- Cheerio
- JSDOM
- mozilla/readability

https://github.com/user-attachments/assets/36389a7b-8a25-465d-8bd4-5dbb7de0804a


## Prerequisites

- Node.js (v18 or higher)
- Anura API key which you can obtain by signing up on the [offical website](https://anura.lilypad.tech/) (note: as of the date of this writing, the API is in beta and free)

## Starting the application

1. Clone the repository:
```bash
git clone https://github.com/narbs91/lilypad-websearch-agent-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file and populate the file using the .env.example file as a reference

4. Start the application:
```bash
npm run dev
```

5. Visit http://localhost:3000 in your browser to see the application in action.

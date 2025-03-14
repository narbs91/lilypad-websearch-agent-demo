# Websearch API powered by Lilpad

This is a demo project showcasing the power of the Lilypad Anura API.  This project combines websearch powered by searXNG with AI powered answers using Anura to help answer questions based on the latest happenings provided as context.  The project is an express application with a vanilla frontend meant only for demonstration purposes.

Technologies used:
- Node.js
- Express
- searXNG
- Anura API
- Cheerio
- JSDOM
- mozilla/readability


https://github.com/user-attachments/assets/36389a7b-8a25-465d-8bd4-5dbb7de0804a


## Prerequisites

- Node.js (v18 or higher)
- Docker (v20 or higher)
- Anura API key which you can obtain by signing up on the [offical website](https://anura.lilypad.tech/) (note: as of the date of this writing, the API is in beta and free)

## Installation

This project requires searXNG to be running in a detached container.  This will allow you to use the search functionality of searXNG to search the web and provide the results to the Anura API to generate answers.

### How to get searXNG running

Pull the searXNG image from Docker Hub.
```bash
docker pull searxng/searxng
```

Start the searxng container with the following command:
```bash
docker run -d --name searxng \
    -p 8888:8080 \
    searxng/searxng
```

With the container running, create a directory for the custom searxng configuration and copy the settings.yml file to it.
```bash
mkdir -p ~/searxng
docker cp searxng:/etc/searxng/settings.yml ~/searxng/settings.yml
```

Open the settings.yml file with vim or your preferred text editor.
```bash
vim ~/searxng/settings.yml
```

and change the following to enable JSON support (search for "default_format") which will allow us to query SearXNG for results in JSON format:
```yml
ui:
  default_format: html
  supported_formats:
    - html
    - json  # <-- Enable JSON support
```

Stop the searxng container:
```bash
docker stop searxng
```

Remove the searxng container:
```bash
docker rm searxng
```

Run the searxng container with the following command to pull in the custom settings.yml file:
```bash
docker run -d --name searxng \
    -p 8888:8080 \
    -v ~/searxng/settings.yml:/etc/searxng/settings.yml \
    searxng/searxng
```

Verify that the container is running:
```bash
docker ps
```

visit http://localhost:8888 in your browser to verify that the searxng instance is running.

## Starting the application

1. Clone the repository:
```bash
git clone https://github.com/lilypad-ai/websearch-demo.git
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

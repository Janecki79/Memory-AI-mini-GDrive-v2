# 🧠 Memory AI – Google Drive Upload

Minimal Express.js service for storing text "memories" and optionally uploading
files to Google Drive.

## Running

1. Install dependencies: `npm install`
2. Start the server: `npm start`

## Panel

A small web panel is served from **`/panel`**. It lets you browse topics, read
saved notes, append new text and try file uploads without writing code. Open it
in a browser while the server is running.

## Authorization

Set the `API_KEY` environment variable to require a shared secret:

```bash
export API_KEY=secret
npm start
```

Every request must then supply the key via the `x-api-key` header:

```bash
curl -H "x-api-key: $API_KEY" http://localhost:3000/status
```

## Google Drive

File uploads are stored locally by default. To also push them to Google Drive:

1. enable the feature: `GDRIVE_ENABLED=1`
2. provide credentials with `CLIENT_SECRET_JSON` (raw JSON or base64) or by
   placing a `client_secret.json` file in the project root

When enabled, upload responses include Drive metadata for the created file. If
Drive is disabled or credentials are missing, uploads complete locally and the
response omits Drive fields.

## Endpoints & cURL examples

Assuming the server runs on `http://localhost:3000` and `API_KEY` contains your
key:

### `GET /status`

Health check.

```bash
curl -H "x-api-key: $API_KEY" http://localhost:3000/status
```

### `POST /memory/:topic`

Append a line of text to a topic.

```bash
curl -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
     -d '{"text":"Hello"}' \
     http://localhost:3000/memory/test
```

### `GET /memory/:topic`

Read all lines for a topic.

```bash
curl -H "x-api-key: $API_KEY" http://localhost:3000/memory/test
```

### `POST /memory/upload`

Upload a file (stored in `data/` and optionally on Google Drive).

```bash
curl -H "x-api-key: $API_KEY" -F "file=@README.md" \
     http://localhost:3000/memory/upload
```

## Testing with scripts

Helper scripts issue the above requests using `curl`:

```bash
bash scripts/test_endpoints.sh
# or on Windows
scripts\test_endpoints.bat
```

Set `BASE_URL` or `API_KEY` environment variables before running to override
defaults.

## Deploy on Render

1. Push the project to GitHub.
2. Create a Web Service on Render.com.
3. In service settings set **Build Command** to `npm ci` and **Start Command**
   to `npm start`.
4. Add `client_secret.json` and `token.json` as **Secret Files**.
5. Click Deploy.


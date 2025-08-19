
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`

## Endpointy

- `GET /status` – prosty status serwera
- `POST /memory/:topic` – zapisuje notatkę `{ "text": "..." }`
- `GET /memory/:topic` – odczytuje notatki
- `POST /memory/upload` – wysyła plik do lokalnego katalogu danych (multipart/form-data)
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive (multipart/form-data)

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
5. Kliknij Deploy.


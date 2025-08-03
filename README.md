
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Endpointy

- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive

## Wdrożenie na Render.

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
4. Kliknij Deploy.


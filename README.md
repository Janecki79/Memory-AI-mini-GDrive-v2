
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Ustaw zmienną środowiskową `API_KEY` (np. `export API_KEY=twoj_klucz`)
3. Uruchom serwer: `npm start`
4. Wysyłaj żądania z nagłówkiem `Authorization: Bearer <API_KEY>`

## Endpointy

- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj zmienną środowiskową `API_KEY` z własnym sekretnym kluczem.
5. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
6. Kliknij Deploy.


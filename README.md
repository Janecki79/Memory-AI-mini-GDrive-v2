
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`

## Endpointy

- `GET /status` – status serwera
- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /memory/upload` – przesyła plik do lokalnej pamięci
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
5. Kliknij Deploy.

## Connect to GPTs (Actions)

1. Open **Actions** → Add from URL: `https://<host>/.well-known/openapi.yaml`
2. Auth: Bearer → header `Authorization: Bearer {{API_KEY}}`
3. Save the secret `API_KEY` equal to Render’s `API_KEY`
4. Test: “Zapisz notatkę do tematu notes…”

```bash
curl -I https://<host>/.well-known/openapi.yaml
```


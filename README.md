
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`

## Endpointy

- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
5. Kliknij Deploy.
6. Po wdrożeniu sprawdź specyfikację OpenAPI:

   ```bash
   curl -I https://<host>/.well-known/openapi.yaml
   ```

   Oczekiwany wynik: `200 OK`.

## Testowanie

Po każdym wdrożeniu możesz potwierdzić dostępność specyfikacji OpenAPI tym samym poleceniem:

```bash
curl -I https://<host>/.well-known/openapi.yaml
```

Powinno zwrócić status `200 OK`.


# 🧠 Memory AI – Google Drive Integration

Minimalny serwer Express.js zapisujący notatki oraz synchronizujący pliki z Google Drive.

## Konfiguracja

Użyj zmiennych środowiskowych zamiast plików z kluczami:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `DRIVE_FOLDER_ID` (opcjonalny – ID istniejącego folderu)

Podczas lokalnego developmentu możesz umieścić je w pliku `.env`.

### Jak zdobyć refresh token
1. Utwórz aplikację OAuth Client ID w [Google Cloud Console](https://console.cloud.google.com/).
2. Skorzystaj z [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) aby zalogować się i uzyskać `refresh_token`.
3. Ustaw zmienne środowiskowe zgodnie z powyższą listą.

## Uruchomienie

```bash
npm install
npm start
```

## Endpointy

- `POST /memory/:topic` – dopisz notatkę do tematu
- `GET /memory/:topic` – odczytaj notatki
- `POST /memory/upload` – prześlij plik lokalnie do katalogu `data/`
- `POST /memory/sync-gdrive` – wyślij wszystkie lokalne pliki do Google Drive
- `GET /memory/list-gdrive` – lista plików w folderze Drive
- `GET /memory/download-gdrive/:file` – pobierz plik tekstowy z Drive

### Przykłady

```bash
# Zapisz notatkę
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"Hello"}' http://localhost:3000/memory/test

# Synchronizuj lokalne pliki z Drive
curl -X POST http://localhost:3000/memory/sync-gdrive

# Pobierz listę plików
curl http://localhost:3000/memory/list-gdrive
```

## Deploy na Render

W pliku `render.yaml` zdefiniowane są wymagane zmienne środowiskowe. Ustaw je w panelu Render i deployuj aplikację.

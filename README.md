
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`

## Endpointy

- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive

## Testowanie endpointów

W katalogu `scripts` znajdują się przykładowe skrypty do sprawdzenia działania API:

- `scripts/test_endpoints.sh` – wersja Bash dla systemów Unix
- `scripts/test_endpoints.bat` – wersja dla Windows

Użycie (domyślne URL):

```bash
bash scripts/test_endpoints.sh
scripts\test_endpoints.bat
```

Można również podać własny URL i opcjonalny klucz API:

```bash
bash scripts/test_endpoints.sh http://localhost:3000 MÓJ_KLUCZ
scripts\test_endpoints.bat http://localhost:3000 MÓJ_KLUCZ
```

Skrypty wykonują `GET /status`, `POST /memory/notes`, `GET /memory/notes`, `POST /memory/upload` oraz `POST /upload-gdrive` (ten ostatni zwykle zwraca `501`, jeśli Google Drive nie jest skonfigurowane).

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
5. Kliknij Deploy..


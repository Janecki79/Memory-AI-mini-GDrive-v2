
# 🧠 Memory AI – Google Drive Upload

Serwer Express.js do zapisywania notatek i przesyłania plików z GPTs do Google Drive.

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm start`

## Panel

Po starcie aplikacji prosty panel administracyjny dostępny jest pod adresem
`/panel`.

## Autoryzacja

Ustaw zmienną środowiskową `API_KEY`, aby chronić większość endpointów. Przy
wykonywaniu żądań dołącz nagłówek:

```
Authorization: Bearer $API_KEY
```

Przykład zapisu notatki:

```
curl -H "Authorization: Bearer $API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"Hello"}' http://localhost:3000/memory/test
```

## Endpointy

- `POST /memory/:topic` – zapisuje notatkę do tematu
- `GET /memory/:topic` – odczytuje notatki
- `POST /memory/upload` – zapisuje plik do lokalnego katalogu `data/`
- `POST /upload-gdrive` – przesyła plik do folderu "Dane-Memory AI mini" na Google Drive
- `GET /status` – podstawowa informacja o stanie serwera

## Konfiguracja Google Drive

1. Włącz integrację: ustaw `GDRIVE_ENABLED=1`.
2. Podaj dane uwierzytelniające:
   - poprzez zmienną `CLIENT_SECRET_JSON` (czysty JSON lub base64), lub
   - poprzez plik `client_secret.json` w katalogu projektu.
3. Przykład przesłania pliku do Google Drive:

```
curl -H "Authorization: Bearer $API_KEY" -F "file=@/ścieżka/plik.txt" \
  http://localhost:3000/upload-gdrive
```

## Testowanie endpointów

Do szybkiej weryfikacji API służy skrypt `scripts/test_endpoints.*`.
Uruchom go np. poleceniem:

```
bash scripts/test_endpoints.sh
```

## Deploy na Render

1. Wgraj projekt na GitHub.
2. Utwórz Web Service na Render.com.
3. W ustawieniach serwisu ustaw **Build Command** na `npm ci` oraz **Start Command** na `npm start`.
4. Dodaj `client_secret.json` i `token.json` jako **Secret Files**.
5. Kliknij Deploy..


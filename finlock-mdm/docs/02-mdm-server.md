# MicroMDM — сервер MDM

## Зачем

FinLock API **не заменяет** MDM — он отправляет команды **в MicroMDM**, а MicroMDM — на iPhone через Apple Push.

## Быстрый деплой (Docker, VPS)

```bash
# На Ubuntu VPS с Docker
git clone https://github.com/micromdm/micromdm
cd micromdm
# Следовать README: apns cert, api key, dep token
docker compose up -d
```

Официальная документация: https://github.com/micromdm/micromdm/wiki

## Минимальные переменные

| Переменная | Описание |
|------------|----------|
| `MICROMDM_URL` | https://mdm.yourdomain.com |
| `MICROMDM_API_KEY` | API key из setup |
| `FINLOCK_WEBHOOK` | URL FinLock для событий check-in |

## FinLock → MicroMDM

В `server/.env`:

```env
MDM_MODE=micromdm
MICROMDM_URL=https://mdm.example.com
MICROMDM_API_KEY=secret
```

Если `MDM_MODE=demo` — команды lock/unlock только в БД (для UI без iPhone).

## Команды lock (пример curl к MicroMDM)

```bash
# DeviceLock — экран блокировки с сообщением
curl -u micromdm:"API_KEY" \
  -X POST "https://mdm.example.com/v1/commands" \
  -H "Content-Type: application/json" \
  -d '{
    "udid": "DEVICE_UDID",
    "request_type": "DeviceLock",
    "pin": "",
    "message": "Оплатите рассрочку 15 000 сом. Тел: +996..."
  }'
```

FinLock API делает это через `server/src/services/mdm.js`.

## Check-in webhook

MicroMDM при каждом check-in iPhone может слать webhook → FinLock обновляет `last_seen`, статус `online`.

## Тест без VPS (только demo)

1. `MDM_MODE=demo` в `.env`  
2. Admin UI — lock/unlock меняет статус в JSON  
3. Когда VPS готов — переключить на `micromdm`

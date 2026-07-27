# FinLock MDM — тестовый MVP

Система дистанционного управления iPhone при продаже в рассрочку (аналог Asia MDM, своё имя).

**Платформа:** только iPhone  
**Этап:** тест на 1–5 устройствах в магазине  
**У магазина есть:** Mac (для Apple Configurator / enrollment)

---

## Что это и как работает

1. При продаже в рассрочку iPhone **enroll** в MDM через Mac (supervised mode).
2. Устройство привязано к клиенту в нашей панели (IMEI, serial, ФИО, договор).
3. При просрочке — **Lock** с сообщением «Оплатите X сом».
4. После оплаты — **Unlock**.
5. События: online/offline, попытка снять профиль, сброс — в журнал.

**IMEI** — для учёта и поиска, **блокировка** — через MDM-команды Apple, не через IMEI.

---

## Быстрый старт (разработка)

### 1. Требования

| Что | Зачем |
|-----|--------|
| Mac магазина | Apple Configurator 2 — подготовка iPhone |
| Apple ID организации | Apple Business Manager (бесплатно, нужен D-U-N-S) |
| VPS или локальный сервер | MDM-сервер MicroMDM |
| Node.js 18+ | API и админка |

### 2. Запуск API (локально)

```bash
cd finlock-mdm/server
npm install
npm run dev
```

API: http://localhost:3847  
Админка: открыть `finlock-mdm/admin/index.html` в браузере (или `npm run admin` если настроен).

### 3. Документация по шагам

| Файл | Содержание |
|------|------------|
| [docs/01-apple-setup.md](docs/01-apple-setup.md) | ABM, сертификаты, Configurator |
| [docs/02-mdm-server.md](docs/02-mdm-server.md) | MicroMDM на VPS |
| [docs/03-enrollment-flow.md](docs/03-enrollment-flow.md) | День продажи: что делает менеджер |
| [docs/architecture.md](docs/architecture.md) | Архитектура и roadmap |

---

## MVP — что уже есть в репозитории

- REST API: регистрация устройства, lock/unlock, статусы
- Заглушка MDM (demo mode) — работает без Apple для UI-теста
- Интеграция MicroMDM — когда сервер поднят, см. `docs/02-mdm-server.md`
- Простая веб-админка

---

## Что нужно сделать в Apple (один раз)

1. Зарегистрировать **Apple Business Manager**: https://business.apple.com  
2. Привязать MDM-сервер (MicroMDM) к ABM  
3. На Mac: **Apple Configurator 2** → подготовить тестовый iPhone (Supervised + MDM profile)

Без enrollment при продаже **дистанционный lock невозможен** — это ограничение Apple, не баг системы.

---

## Переименование бренда

Рабочее имя **FinLock**. Перед продакшеном заменить в:

- `admin/index.html` — заголовок
- `server/src/config.js` — `APP_NAME`
- MDM display name в профиле (Configurator)

---

## Следующие шаги после успешного теста

1. CRM: клиент, график платежей, автоблок по просрочке  
2. SMS/push клиенту перед блокировкой (grace 3 дня)  
3. Self-service: QR на экране lock → оплата → auto-unlock  
4. Tamper alerts: снятие MDM, смена SIM  
5. Масштаб: ABM + DEP для автоматического enrollment из коробки  

---

## Важно юридически

Клиент подписывает, что iPhone под управлением MDM до конца рассрочки. Lock только при просрочке по договору.

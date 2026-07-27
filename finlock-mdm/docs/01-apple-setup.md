# Apple Business Manager + Mac — настройка (один раз)

## 1. Apple Business Manager (ABM)

1. Перейти на https://business.apple.com  
2. Зарегистрировать организацию (нужен **D-U-N-S** номер компании).  
3. Создать **MDM Server** token — скачать `.p7m` для привязки MicroMDM.  
4. Добавить пользователей магазина (роли Admin / Device Manager).

> Без ABM можно тестировать **вручную** через Configurator (Supervised), но для масштаба ABM обязателен.

## 2. Apple Configurator 2 на Mac магазина

1. App Store → **Apple Configurator 2** (бесплатно).  
2. Подключить тестовый iPhone USB.  
3. **Prepare** → Manual Configuration:
   - ☑ Supervise devices  
   - ☑ Allow devices to pair with other Macs (по политике)  
   - MDM Server: URL вашего MicroMDM (после деплоя)  
4. После Prepare iPhone в **Supervised** режиме и с MDM-профилем.

## 3. Сертификаты MDM (MicroMDM)

MicroMDM требует:

| Сертификат | Где взять |
|------------|-----------|
| **APNs Push** | Apple Push Certificates Portal (identity.apple.com/pushcert) |
| **DEP token** | ABM → Settings → Device Management → download token |

Подробно: [02-mdm-server.md](02-mdm-server.md)

## 4. Что записать при продаже

При оформлении рассрочки менеджер вносит в FinLock:

- Serial Number (Настройки → Основные → Об этом устройстве)  
- IMEI (там же)  
- Модель  
- ФИО клиента, телефон, номер договора  

После enrollment в MicroMDM появится **UDID** — FinLock подтянет автоматически (webhook) или вручную.

## 5. iCloud магазина vs MDM

| | iCloud lock | FinLock MDM |
|---|-------------|-------------|
| Кто владелец Apple ID | Магазин | Клиент (свой Apple ID) |
| Блокировка | Activation Lock | MDM DeviceLock |
| Снятие клиентом | Сложно без пароля магазина | Нельзя без снятия MDM |
| Для рассрочки | Устаревший подход | Рекомендуемый |

**Не ставить** iCloud магазина на клиентский телефон — только MDM + договор.

## 6. Чеклист перед первым тестом

- [ ] ABM аккаунт создан (или ручной Supervised для теста)  
- [ ] MicroMDM запущен, APNs настроен  
- [ ] Configurator подготовил 1 iPhone  
- [ ] FinLock API запущен, устройство добавлено  
- [ ] Lock с Mac/админки → iPhone заблокировался  
- [ ] Unlock → iPhone разблокировался  

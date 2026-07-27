import { Router } from 'express';
import * as store from '../store.js';
import * as mdm from '../services/mdm.js';

const router = Router();

router.get('/', (req, res) => {
  const q = req.query.q || req.query.imei || '';
  res.json(q ? store.searchDevices(q) : store.listDevices());
});

router.get('/:id', (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'not_found' });
  res.json(device);
});

router.post('/', (req, res) => {
  const { serial, imei, model, customerName, customerPhone, contractId, installmentTotal, nextPaymentDate, udid } =
    req.body || {};
  if (!serial) return res.status(400).json({ error: 'serial required' });
  if (store.findBySerial(serial)) return res.status(409).json({ error: 'serial already registered' });
  const device = store.createDevice({
    serial,
    imei,
    model,
    customerName,
    customerPhone,
    contractId,
    installmentTotal,
    nextPaymentDate,
    udid,
  });
  if (udid) store.updateDevice(device.id, { status: 'active' });
  res.status(201).json(store.getDevice(device.id));
});

router.post('/:id/lock', async (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'not_found' });
  const message = req.body?.message || 'Оплатите рассрочку. Обратитесь в магазин.';
  const result = await mdm.sendLock(device, message);
  if (!result.ok) return res.status(502).json({ error: result.error, mdm: result });
  const updated = store.updateDevice(device.id, { status: 'locked', lockMessage: message });
  store.addEvent(device.id, 'locked', message);
  res.json({ device: updated, mdm: result });
});

router.post('/:id/unlock', async (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'not_found' });
  const result = await mdm.sendUnlock(device);
  if (!result.ok) return res.status(502).json({ error: result.error, mdm: result });
  const updated = store.updateDevice(device.id, { status: 'active', lockMessage: '' });
  store.addEvent(device.id, 'unlocked', 'Разблокировано после оплаты');
  res.json({ device: updated, mdm: result });
});

router.post('/:id/clear-passcode', async (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'not_found' });
  const result = await mdm.sendClearPasscode(device);
  if (!result.ok) return res.status(502).json({ error: result.error, mdm: result });
  store.addEvent(device.id, 'clear_passcode', 'Сброс PIN через MDM');
  res.json({ device, mdm: result });
});

router.post('/:id/checkin', (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) return res.status(404).json({ error: 'not_found' });
  const updated = store.updateDevice(device.id, {
    lastSeen: new Date().toISOString(),
    status: device.status === 'offline' ? 'active' : device.status,
  });
  res.json(updated);
});

export default router;

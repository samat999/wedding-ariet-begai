import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../data/devices.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ devices: [], events: [] }, null, 2));
  }
}

function readDb() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDb(db) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function listDevices() {
  return readDb().devices;
}

export function searchDevices(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return listDevices();
  return listDevices().filter((d) =>
    [d.imei, d.serial, d.model, d.customerName, d.customerPhone, d.contractId, d.udid]
      .some((v) => String(v || '').toLowerCase().includes(q))
  );
}

export function findByImei(imei) {
  return readDb().devices.find((d) => d.imei === imei);
}

export function getDevice(id) {
  return readDb().devices.find((d) => d.id === id);
}

export function findBySerial(serial) {
  return readDb().devices.find((d) => d.serial === serial);
}

export function createDevice(payload) {
  const db = readDb();
  const device = {
    id: crypto.randomUUID(),
    serial: payload.serial,
    imei: payload.imei || '',
    udid: payload.udid || '',
    model: payload.model || '',
    customerName: payload.customerName || '',
    customerPhone: payload.customerPhone || '',
    contractId: payload.contractId || '',
    installmentTotal: payload.installmentTotal || 0,
    nextPaymentDate: payload.nextPaymentDate || '',
    status: 'pending',
    lockMessage: '',
    lastSeen: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.devices.push(device);
  addEvent(device.id, 'registered', 'Устройство зарегистрировано');
  writeDb(db);
  return device;
}

export function updateDevice(id, patch) {
  const db = readDb();
  const idx = db.devices.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  db.devices[idx] = {
    ...db.devices[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.devices[idx];
}

export function addEvent(deviceId, type, message, meta = {}) {
  const db = readDb();
  if (!db.events) db.events = [];
  const event = {
    id: crypto.randomUUID(),
    deviceId,
    type,
    message,
    meta,
    at: new Date().toISOString(),
  };
  db.events.unshift(event);
  if (db.events.length > 500) db.events = db.events.slice(0, 500);
  writeDb(db);
  return event;
}

export function listEvents(deviceId = null, limit = 50) {
  let events = readDb().events || [];
  if (deviceId) events = events.filter((e) => e.deviceId === deviceId);
  return events.slice(0, limit);
}

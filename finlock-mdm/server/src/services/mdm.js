import { config } from '../config.js';

/**
 * MDM adapter: demo (local only) or micromdm (production).
 */
export async function sendLock(device, message) {
  if (config.mdmMode === 'demo') {
    return { ok: true, mode: 'demo', message: 'Lock simulated' };
  }
  if (!device.udid) {
    return { ok: false, error: 'UDID missing — device not enrolled in MDM' };
  }
  return micromdmCommand(device.udid, {
    request_type: 'DeviceLock',
    pin: '',
    message: message || 'Оплатите рассрочку',
  });
}

export async function sendUnlock(device) {
  if (config.mdmMode === 'demo') {
    return { ok: true, mode: 'demo', message: 'Unlock simulated' };
  }
  if (!device.udid) {
    return { ok: false, error: 'UDID missing' };
  }
  return micromdmCommand(device.udid, {
    request_type: 'ClearPasscode',
  });
}

export async function sendClearPasscode(device) {
  if (config.mdmMode === 'demo') {
    return { ok: true, mode: 'demo', message: 'ClearPasscode simulated' };
  }
  if (!device.udid) {
    return { ok: false, error: 'UDID missing' };
  }
  return micromdmCommand(device.udid, {
    request_type: 'ClearPasscode',
  });
}

async function micromdmCommand(udid, payload) {
  const { url, apiKey } = config.micromdm;
  if (!url || !apiKey) {
    return { ok: false, error: 'MICROMDM_URL or MICROMDM_API_KEY not set' };
  }
  try {
    const res = await fetch(`${url}/v1/commands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`micromdm:${apiKey}`).toString('base64')}`,
      },
      body: JSON.stringify({ udid, ...payload }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: text, status: res.status };
    return { ok: true, body: text };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function getMdmStatus() {
  return {
    mode: config.mdmMode,
    micromdmConfigured: Boolean(config.micromdm.url && config.micromdm.apiKey),
  };
}

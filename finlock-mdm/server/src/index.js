import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import devicesRouter from './routes/devices.js';
import * as store from './store.js';
import * as mdm from './services/mdm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: config.appName,
    mdm: mdm.getMdmStatus(),
  });
});

app.get('/api/events', (req, res) => {
  const deviceId = req.query.deviceId || null;
  res.json(store.listEvents(deviceId, 100));
});

app.use('/api/devices', devicesRouter);

const adminPath = path.join(__dirname, '../../admin');
app.use(express.static(adminPath));

app.listen(config.port, () => {
  console.log(`${config.appName} API http://localhost:${config.port}`);
  console.log(`Admin UI  http://localhost:${config.port}/index.html`);
  console.log(`MDM mode: ${config.mdmMode}`);
});

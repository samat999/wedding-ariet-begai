import qrcode from 'qrcode-terminal';
import os from 'os';
import { spawn } from 'child_process';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Игнорируем внутренние и не-IPv4 адреса
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const port = 5173;
const ip = getLocalIp();
const url = `http://${ip}:${port}`;

console.log('\n🚀 Запуск сервера разработки...\n');
console.log(`📱 Отсканируйте QR-код для доступа с телефона:`);
console.log(`📡 Или откройте в браузере: ${url}\n`);

// Генерируем QR-код
qrcode.generate(url, { small: true }, function (qrcode) {
  console.log(qrcode);
  console.log(`\n✅ Сервер запущен! Нажмите Ctrl+C для остановки.\n`);
});

// Запускаем Vite сервер
const vite = spawn('npx', ['vite', '--host', '--port', port.toString()], {
  stdio: 'inherit',
  shell: true
});

vite.on('error', (err) => {
  console.error(`❌ Ошибка запуска Vite: ${err.message}`);
  process.exit(1);
});

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n\n🛑 Остановка сервера...');
  vite.kill();
  process.exit(0);
});

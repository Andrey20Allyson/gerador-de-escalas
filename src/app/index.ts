import { app, BrowserWindow } from 'electron';
import { createServer } from './server';
import { loadApi } from './api/server';
import { fromRoot } from './root-path';

async function createWindow(host: string, port = 80) {
  const window = new BrowserWindow({
    width: 900,
    height: 500,
    autoHideMenuBar: true,
    icon: fromRoot('./public/assets/images/brasao.png'),
    resizable: false,
  });

  await window.loadURL(`http://${host}:${port}/`).catch(console.error);

  return window;
}

async function main() {
  const host = 'localhost';
  const port = 5545;

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(host, port);
    }
  });

  const { server, listen } = createServer(host, port);

  loadApi(server);

  await listen;

  await createWindow(host, port);
}

function quit() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

app.on('ready', main);
app.on('window-all-closed', quit);
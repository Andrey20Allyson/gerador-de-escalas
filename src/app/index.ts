import { app, BrowserWindow, ipcMain } from 'electron';
import { fromRoot } from './path.utils';
import { loadAPI } from './api';

async function createWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 700,
    autoHideMenuBar: true,
    icon: fromRoot('./public/assets/images/brasao.png'),
    resizable: false,
    webPreferences: {
      preload: fromRoot('./dist/preload.js'),
    },
  });

  await window.loadFile(fromRoot('./public/index.html'));

  return window;
}

async function main() {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  await loadAPI();
  await createWindow();
}

function quit() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

app.on('ready', main);
app.on('window-all-closed', quit);
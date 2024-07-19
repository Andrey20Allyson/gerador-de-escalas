import { app, BrowserWindow } from 'electron';
import { loadAPI } from './api';
import { fromRoot } from './path.utils';

async function createWindow() {
  const window = new BrowserWindow({
    width: 1400,
    minWidth: 1400,
    height: 900,
    minHeight: 900,
    autoHideMenuBar: true,
    // titleBarStyle: 'hidden',
    icon: fromRoot('./public/assets/images/brasao.png'),
    fullscreenable: true,
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
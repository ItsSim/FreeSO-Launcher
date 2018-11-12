// fsolauncher
// \src\index.ts

import * as Electron from "electron";
import installExtension, {
   REACT_DEVELOPER_TOOLS,
   REDUX_DEVTOOLS
} from "electron-devtools-installer";
import { enableLiveReload } from "electron-compile";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
   enableLiveReload({ strategy: "react-hmr" });
}

const createWindow = async () => {
   const options: Electron.BrowserWindowConstructorOptions = {};
   const width = 1100;
   const height = 675;

   options.minWidth = width;
   options.minHeight = height;
   options.maxWidth = width;
   options.maxHeight = height;
   options.center = true;
   options.maximizable = false;
   options.width = width;
   options.height = height;
   options.resizable = false;
   options.icon = "beta.ico";
   options.show = false;
   options.title = "FreeSO Launcher";

   // Create the browser window.
   mainWindow = new Electron.BrowserWindow(options);

   mainWindow.setMenu(null);

   // and load the index.html of the app.
   mainWindow.loadURL(`file://${__dirname}/index.html`);

   // Open the DevTools.
   if (isDevMode) {
      await installExtension(REACT_DEVELOPER_TOOLS);
      await installExtension(REDUX_DEVTOOLS);
      mainWindow.webContents.openDevTools();
   }

   mainWindow.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      Electron.shell.openExternal(url);
   });

   // Emitted when the window is closed.
   mainWindow.on(
      "closed",
      (): any =>
         // Dereference the window object, usually you would store windows
         // in an array if your app supports multi windows, this is the time
         // when you should delete the corresponding element.
         (mainWindow = null)
   );
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
Electron.app.on("ready", createWindow);

// Quit when all windows are closed.
Electron.app.on(
   "window-all-closed",
   () =>
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      process.platform !== "darwin" && Electron.app.quit()
);

Electron.app.on(
   "activate",
   () =>
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      mainWindow === null && createWindow()
);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
let shouldQuit = Electron.app.makeSingleInstance(
   () => mainWindow && (mainWindow.show(), mainWindow.focus())
);

shouldQuit && Electron.app.quit();
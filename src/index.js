const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const shutdown = require('electron-shutdown-command');
const si = require('systeminformation');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let pjson = require('../package.json');

let mainWindow

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    kiosk: true,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  
  mainWindow.on("closed", function () {
    mainWindow = null
  })
  
};

/*
*   Listeners from user key commands
*/
app.whenReady().then(() => {
  //   Unpair
  globalShortcut.register('CommandOrControl+H', () => {
    console.log("Unpairing..")
    mainWindow.webContents.send("unpair-host", "/unpair")
  })
  //  Restarts app
  globalShortcut.register('CommandOrControl+J', () => {
    console.log('Restarting app..')
    app.relaunch()
    app.exit()
  })
  // Opens change host input
  globalShortcut.register('CommandOrControl+U', () => {
    console.log('Opening change host modal..')
    mainWindow.webContents.send("change-host-view", "change host")
  })
  //reboot app
  globalShortcut.register('CommandOrControl+A+J', () => {
    console.log('Rebooting device..')
    rebootDevice()
  })
  globalShortcut.register('CommandOrControl+U', () => {
      console.log('Opening change host modal..')
      mainWindow.webContents.send("change-host-view", "change host")
  })
  globalShortcut.register('CommandOrControl+D', () => {
    console.log('Opening change host modal..')
    mainWindow.webContents.openDevTools()
})

})

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("reboot-device", function() {
  rebootDevice()
})

/*
*   Reboots device
*/
function rebootDevice() {
  shutdown.reboot({
    force: true,
    timerseconds: 5,
    sudo: true,
    debug: false,
    quitapp: true,
  })
}

function sendDeviceInfo(physical_id) {
  var options = {}
      options["Host"] = host
      options["App-version"] = pjson.version
      si.osInfo()
      .then(data => options["Platform-OS"] = data.platform)
      si.system()
      .then(data => options["Model"] = data.model)
      si.version()
      .then(data => options["Uptime"] = data.uptime)

  var request = new XMLHttpRequest();
  request.open("post", host +"/listenerss/set_options/"+physical_id+"/");
  request.setRequestHeader("Content-Type", "application/json");
  request.send('{"options":'+JSON.stringify(options)+'}');
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      console.log(request.responseText)
    }
  }
}

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const { autoUpdater } = require("electron-updater")
const log = require('electron-log');
const path = require('path');
const shutdown = require('electron-shutdown-command');
const si = require('systeminformation');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let pjson = require('../package.json');
let fs = require('fs');

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"

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
  //  reboot device
  globalShortcut.register('CommandOrControl+A+J', () => {
    console.log('Rebooting device..')
    rebootDevice()
  })
  //  Opens debTools
  globalShortcut.register('CommandOrControl+D', () => {
    console.log('Opening DevTools..')
    mainWindow.webContents.openDevTools()
})

})

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdates()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  printInfo = false
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


/*
*   Listeners from renderer. Called when server sends message
*/
ipcMain.on("reboot-device", function() {
  rebootDevice()
})
ipcMain.on("restart-app", function() {
  app.relaunch()
  app.exit()
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

/*
*   Sends device info
*/
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

function printDeviceInfo() {
  /* setInterval(function() {
    si.cpuCurrentspeed().then(data => {
      fs.appendFile('logCPU.txt', data.avg + " ", function (err) {
        if (err) throw err;
      })
    })
  }, 500)

  setInterval(function() {
    si.mem().then(data => {
      fs.appendFile('logRAM.txt', data.used + " ", function (err) {
        if (err) throw err;
      })
    })
  }, 500) */
  si.mem().then(data => {
      console.log(data.used)
    })
    setTimeout(printDeviceInfo, 1000)
}

const sendStatusToWindows = (text) => {
  log.info(text)
  if (mainWindow) {
    mainWindow.webContents.send("message", text)
  }
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindows("Checking for update...")
})

autoUpdater.on("update-available", (info) => {
  sendStatusToWindows("Update available")
  sendStatusToWindows("Version", info.version)
  sendStatusToWindows("Release date", info.releaseDate)
})

autoUpdater.on("update-not-available", () => {
  sendStatusToWindows("Update not available")
})

autoUpdater.on("download-progress", (progress) => {
  sendStatusToWindows(`Progress ${math.floor(progress.percent)}`)
})

autoUpdater.on("update-downloaded", (info) => {
  sendStatusToWindows("Update downloaded")
  autoUpdater.quitAndInstall()
})

autoUpdater.on("error", (error) => {
  console.errer(error)
})



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

var host = "http://app.infoskjermen.no"

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    alwaysOnTop: true,
    width: 1920,
    height: 1080,
    kiosk: false,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
    icon: path.join(__dirname, '../assets/icon/png/logo256.png')
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
  //  Opens change host input
  globalShortcut.register('CommandOrControl+U', () => {
    console.log('Opening change host modal..')
    mainWindow.webContents.send("change-host-view", "change host")
  })
  //  reboot device
  globalShortcut.register('CommandOrControl+A+J', () => {
    console.log('Rebooting device..')
    rebootDevice()
  })
  //  Opens devTools
  globalShortcut.register('CommandOrControl+D', () => {
    console.log('Opening DevTools..')
    mainWindow.webContents.openDevTools()
})

})

app.on('ready', () => {
  createWindow()
});

app.on("ready", () => {
  autoUpdater.checkForUpdates()
})

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
ipcMain.on("physical_id", (event, arg) => {
  sendDeviceInfo(arg)
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
  console.log(physical_id)
  var options = {}
      options["Host"] = host
      options["App-version"] = pjson.version
      si.osInfo()
      .then(data => options["Platform-OS"] = data.platform)
      si.system()
      .then(data => options["Model"] = data.model)
      

  var request = new XMLHttpRequest();
  request.open("post", host +"/listeners/set_options/"+physical_id+"/");
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
  mainWindow.webContents.send("message", text)
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindows("Checking for update...")
})

autoUpdater.on("update-available", (info) => {
  sendStatusToWindows("Update available")
  sendStatusToWindows("Version: " + info.version)
  sendStatusToWindows("Release date: " + info.releaseDate)
})

autoUpdater.on("update-not-available", () => {
  sendStatusToWindows("Update not available")
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindows(log_message);
})

autoUpdater.on("update-downloaded", (info) => {
  sendStatusToWindows("Update downloaded")
  autoUpdater.quitAndInstall()
})

autoUpdater.on("error", (error) => {
  console.error(`Error in updater : ${error.toString()}`)
})



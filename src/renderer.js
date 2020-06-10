const { ipcRenderer } = require('electron');

console.log("Connected")
//let host = "http://app.infoskjermen.no"
//let host = "http://10.0.1.10:3000/v10/ppm128"
let host = "http://10.0.1.10:3000"
let electron = true


window.onload = function() {
    
    myStorage = window.localStorage;
    change_host_view = document.getElementById('change_host_view');
    iframe = document.getElementById("iframe");
    iframe.src = host + "/go"

    console.log(myStorage.getItem("host"))
    
    window.addEventListener("message", function(e) {
        console.log(e.data);
        var request = JSON.parse(e.data);
        var response = new Object
        
        switch (request.action) {
            case "reboot":
                ipcRenderer.send("reboot-device", "reboot")
                break;
        }

    })

    window.addEventListener("m", function(e) {
        console.log("message")
    })

    ipcRenderer.on("unpair-host", function(evet, message) {
        consolea .log(message)
        iframe.src = host + message
    })

    ipcRenderer.on("change-host-view", function(evet, message) {
        console.log(message)
        change_host_view.style.opacity == 0 ? change_host_view.style.opacity = 1 : change_host_view.style.opacity = 0
    })
  
    window.addEventListener("unpair-host", function(e) {
        console.log("message")
    })

    /* this.change_host_view.addEventListener("click", function(e) {
        host = document.getElementById('host_input').value 
        change_host_view.style.opacity = 0

        iframe.src = host + "/go"

        myStorage.setItem("host", host)
    })
 */







}
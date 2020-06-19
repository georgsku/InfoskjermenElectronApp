const { ipcRenderer } = require('electron');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
console.log("Connected")

let host = "http://app.infoskjermen.no"
//let host = "http://10.0.1.10:3000/v10/ppm128"
//let host = "http://10.0.1.10:3000"

window.onload = function() {
    
    myStorage = window.localStorage;
    change_host_view = document.getElementById('change_host_view');
    iframe = document.getElementById("iframe");
    splash = document.getElementById('splash')
    storagehost = myStorage.getItem("host") 
    
    console.log(myStorage.getItem("host"))
    console.log(window.location.hash.substring(1))

    iframe_load_go()
    
    
    /*
    *   Listener from server
    */
    window.addEventListener("message", function(e) {
        console.log(e.data);
        var request = JSON.parse(e.data);
        
        switch (request.action) {
            case "reboot":
                ipcRenderer.send("reboot-device", "reboot")
                break;
            case "restart":
                ipcRenderer.send("restart-app", "restart")
                break;
        }

    })

    /*
    *   Listens from main and changes src and unpairs
    */
    ipcRenderer.on("unpair-host", function(event, message) {
        console.log(message)
        iframe.src = host + message
    })

    /*
    *   Listens from main and opens change host view
    */
    ipcRenderer.on("change-host-view", function(event, message) {
        console.log(message)
        change_host_view.style.opacity == 0 ? change_host_view.style.opacity = 1 : change_host_view.style.opacity = 0
    })

    /*
    *   Changes src when "endre" is clicked
    */
    this.change_host_view.addEventListener("click", function(e) {
        host = document.getElementById('host_input').value 
        change_host_view.style.opacity = 0

        iframe.src = host + "/go"

        myStorage.setItem("host", host)
    })

    /*
    *   Function for changing on screen tekst
    */
    function splashMessage(message) {
        console.log(message)
        splash.contentWindow.setMessage(message)
    }

    /*
    *   Called when window loads. Checks infoskjermen server and loads host. Handles error and no internet
    */
    function iframe_load_go(){
        var request = new XMLHttpRequest();
        request.timeout = 4000
        request.open("get", host + "/up");
        request.setRequestHeader("Content-Type", "application/json");
        request.onload = function() {
            if (request.status == 200) {
                splashMessage("Let's go!")
                if (storagehost == null) {
                    iframe.src = iframe.src = host+"/go"
                } else {
                    iframe.src = myStorage.getItem("host")+"/go"
                }
            } else {
                splashMessage("Reconnecting ... [500]")
                setTimeout(iframe_load_go,10000)
            }
        }
    
        request.onerror = function(e) {
            splashMessage("Reconnecting ... [ERROR]")
            setTimeout(iframe_load_go,10000)
        }
    
        request.ontimeout = function(e) {
            splashMessage("Reconnecting ... [TIMEOUT]")
            setTimeout(iframe_load_go,10000)
        };
    
        request.send()
    }

    ipcRenderer.on('message', function(event, text) {
        console.log(text)
    })


}
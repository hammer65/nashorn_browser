#!/usr/bin/jjs -Dnashorn.args=-fx -cp ./java
// Get java stuff
var m = Java.type("com.jbrowser.util.HostWindow");
var home = $ENV.PWD;
var file = "file://${home}/html/history.html";
var hostWindow = new m(file);
hostWindow.show();

var Platform = Java.type("javafx.application.Platform");
var Timer    = Java.type("java.util.Timer");

function setInterval(func, milliseconds) {
  // New timer, run as daemon so the application can quit
  var timer = new Timer("setInterval", true);
  timer.schedule(function() Platform.runLater(func), milliseconds, milliseconds); 
  return timer;
}

function clearInterval(timer) {
  timer.cancel();
}

function setTimeout(func, milliseconds) {
  // New timer, run as daemon so the application can quit
  var timer = new Timer("setTimeout", true);
  timer.schedule(function() Platform.runLater(func), milliseconds); 
  return timer;
}

function clearTimeout(timer) {
  timer.cancel();
}
setTimeout(function(){
  payload = 
    [
      {
        title: "Google",
        url: "http://google.com",
        date: new Date().toString()
      },
      {
        title: "Amazon",
        url: "http://amazon.com",
        date: new Date().toString()
      }
    ]
    
  
  hostWindow.execJS('HOST:previous',JSON.stringify(payload));
},8000)
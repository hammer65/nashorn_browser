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
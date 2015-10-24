// load custom stuff
load("file://${script_dir}/jsobject.js");
// load java stuff
var Platform = Java.type("javafx.application.Platform");
function WebViewWrapper(onload) {
  var This = this;
  var WebView = Java.type("javafx.scene.web.WebView");
  var ChangeListener = javafx.beans.value.ChangeListener;
  var decoder = java.net.URLDecoder.decode;
  var webview = new WebView();
  var URL = java.net.URL;

  This.webview = webview;
  This.engine = webview.engine;
  This.window = undefined;
  This.document = undefined;

  // Make sure the JavaScript is enabled.
  This.engine.javaScriptEnabled = true;

  // Complete initialization when page is loaded.
  This.engine.loadWorker.stateProperty().addListener(new ChangeListener() {
    changed: function(value, oldState, newState) {
      if (newState == Worker.State.SUCCEEDED) {
        
        This.document = wrap(This.engine.executeScript("document"));
        This.window = wrap(This.engine.executeScript("window"));
        setLocationListener();

        // Call users onload function.
        if (onload) {
          onload(This);
        }
      }
    }
  });

  // Divert alert message to execute command.
  This.engine.onAlert = new javafx.event.EventHandler() {
    handle: function(evt) {
      var payload = processURL(evt.data)
      This.hostExec(payload)
    }
  };

  

  // Load page from URL.
  This.load = function(url) {
    This.engine.load(url);
  }

  // Load page from text.
  This.loadContent = function(text) {
    This.engine.loadContent(text);
  }

  // Fire the ARMSG event in the window when we want to execute something in the container
  This.containerExec = function(msg){
    This.engine.executeScript(
      "var EVENT = new CustomEvent('${This.customEventName}',{detail: '${msg}'});\n" + 
      "document.dispatchEvent(EVENT);"
    );
  }

  function setLocationListener(){
      This.engine.locationProperty().addListener(new ChangeListener(){
          changed: function(value, oldloc, newloc){
            
          }
      });
  }
}


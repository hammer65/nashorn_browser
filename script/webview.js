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
        //This.window.executeScript("window").setMember('HOST',new testObj());
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
      "var AREVENT = new CustomEvent('ARMSG',{detail: '${msg}'});\n" + 
      "document.dispatchEvent(AREVENT);"
    );
  }

  This.hostExec = function(msg){
    This.emit("ARMSG",msg);
  }

  function setLocationListener(){
    // listen for location change. check URL before letting it load new location
    // if it's an Applied arm (Applied Rater Message) URL we want it conrol the app not go somewhere
    This.engine.locationProperty().addListener(new ChangeListener(){
          changed: function(value, oldloc, newloc){
            var load_URL = newloc;
            var payload = {};
            var URL_obj;
            var method;
            if(newloc.match('//appliedsystems.com/arm')){
              load_URL = oldloc;
              // Send out the event so we can execute the command
              This.hostExec(processURL(newloc));
            }
            // JVM hates this if just loaded. thread it
            Platform.runLater(function(){
              This.load(load_URL)
            });
          }
      });
  }

  function parseQuery(qstr){
    var out = {};
    if(qstr){
      var qarr = qstr.split('&');
      var split;
      for(var i = 0;i < qarr.length;i++){
        split = qarr[i].split("=");
        out[split[0]] = decoder(split[1],"UTF-8");
      }
    }
    return out;
  }

  function processURL(strURL){
    var payload = {};
    var URL_obj = new URL(strURL);
    method = URL_obj.path.match(/\/arm\/(\w+)?/);
    payload = parseQuery(URL_obj.query);
    payload.method = method? method[1] : "defaultMethod";
    return payload;
  }
}


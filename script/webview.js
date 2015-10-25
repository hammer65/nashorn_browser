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
  This.backButton;
  This.stopReloadBtn;
  This.forwardBtn;
  This.URLField;

  // Make sure the JavaScript is enabled.
  This.engine.javaScriptEnabled = true;

  // Complete initialization when page is loaded.
  This.engine.loadWorker.stateProperty().addListener(new ChangeListener() {
    changed: function(value, oldState, newState) {
      print('**********');
      print(Worker.State);
      switch(newState){
        case Worker.State.SUCCEEDED:
          This.document = wrap(This.engine.executeScript("document"));
          This.window = wrap(This.engine.executeScript("window"));
          setLocationListener();
          This.emit('LOADED');
          // Call users onload function.
          if (onload) {
            onload(This);
          }
          break;
        case Worker.State.RUNNING:
          This.emit('LOADING');
          break;
      }
    }
  });

  // Divert alert message to execute command.
  This.engine.onAlert = new javafx.event.EventHandler() {
    handle: function(evt) {
      
    }
  };

  This.setBackButton = function(btn){
    This.backButton = btn;
    This.backButton.onAction = function(){
      var history = This.engine.getHistory();
      
      if(canGoBack()){
        runLater(function(){
            history.get(-1);
        });
      }
    }
  };

  This.setStopReloadBtn = function(btn){
    This.stopReloadBtn = btn;
    This.on("LOADING",function(){
      This.stopReloadBtn.setText('Stop');
    });
    This.on('LOADED',function(){
      This.stopReloadBtn.setText('Reload');
    })
  }

  This.setForwardBtn = function(btn){
    This.forwardBtn = btn;
    This.forwardBtn.onAction = function(){
      var history = This.engine.getHistory();
      
      if(canGoForward()){
        runLater(function(){
          history.go(1);
        });
      }
    }
  }

  This.setURLField = function(btn){
    This.URLField = btn;
    This.on('CHGLOCATION',function(URL){
      This.URLField.setText(URL);
    });
    
  }

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

  function canGoBack(){
    var history = This.engine.getHistory();
    var entryList = history.getEntries();
    var currentIndex = history.getCurrentIndex();
    return (currentIndex > 0);
  }

  function canGoForward(){
    var history = This.engine.getHistory();
    var entriesList = history.getEntries();
    var currentIndex = history.getCurrentIndex();
    return (currentIndex < entryList.size());
  }

  function runLater(func){
    if(typeof func == 'function'){
      Platform.runLater(func);
    }
  }

  function setLocationListener(){
      This.engine.locationProperty().addListener(new ChangeListener(){
          changed: function(value, oldloc, newloc){
            
          }
      });
  }
}


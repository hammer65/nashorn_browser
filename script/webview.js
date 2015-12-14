// load custom stuff
load("file://${script_dir}/jsobject.js");
load("file://${script_dir}/saved_history.js");
// load java stuff
var Platform = Java.type("javafx.application.Platform");
function WebViewWrapper(onload) {
  var This = this;
  var WebView = Java.type("javafx.scene.web.WebView");
  var ChangeListener = javafx.beans.value.ChangeListener;
  var AlertType = javafx.scene.control.Alert.AlertType;
  var decoder = java.net.URLDecoder.decode;
  var webview = new WebView();
  var URL = java.net.URL;
  var savedHistory = new SavedHistory();

  This.webview = webview;
  This.engine = webview.engine;
  This.window = undefined;
  This.document = undefined;
  This.backBtn;
  This.stopReloadBtn;
  This.forwardBtn;
  This.URLField;

  // Make sure the JavaScript is enabled.
  This.engine.javaScriptEnabled = true;

  // Complete initialization when page is loaded.
  This.engine.loadWorker.stateProperty().addListener(new ChangeListener() {
    changed: function(value, oldState, newState) {
      switch(newState){
        case Worker.State.SUCCEEDED:
          //This.document = wrap(This.engine.executeScript("document"));
          This.document = This.engine.document
          This.window = wrap(This.engine.executeScript("window"));
          
          setLocationListener();
          This.emit('LOADED');
          // Call users onload function.
          if (onload) {
            onload();
          }
          break;
        case Worker.State.RUNNING:
          This.emit('LOADING');
          break;
        case Worker.State.CANCELLED:
          This.emit("CANCELLED")
      }
    }
  });

  This.engine.onAlert = new javafx.event.EventHandler() {
    handle: function(evt) {
      runLater(function(){
        Utility.dialog(AlertType.WARNING,evt.data);
      });
    }
  };

  This.engine.setConfirmHandler(function(evt){
    return Utility.dialog(AlertType.CONFIRMATION,evt.data);
  });

  This.engine.setPromptHandler(function(evt){
    return Utility.dialog("PROMPT",evt.data);
  });

  This.setBackButton = function(btn){
    This.backBtn = btn;
    This.backBtn.onAction = function(){
      var history = This.engine.getHistory();
      
      if(This.canGoBack()){
        runLater(function(){
            history.go(-1);
        });
      }
    }
  };

  This.setStopReloadButton = function(btn){
    This.stopReloadBtn = btn;
    This.on("LOADING",function(){
      This.stopReloadBtn.setText('Stop');
    });
    This.on('LOADED',function(){
      This.stopReloadBtn.setText('Reload');
    });
    This.on('CANCELLED',function(){
      This.stopReloadBtn.setText('Reload')
    })
    btn.onAction = function(){
      var worker = This.engine.loadWorker;
      print(worker.state);
      if(worker.state == Worker.State.RUNNING){
        runLater(function(){
          worker.cancel();
        });
      }else{
        runLater(function(){
          This.engine.reload();
        });
      }
    }
  };

  This.setForwardButton = function(btn){
    This.forwardBtn = btn;
    This.forwardBtn.onAction = function(){
      var history = This.engine.getHistory();
      
      if(This.canGoForward()){
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
    This.URLField.onKeyReleased = function(e){
      if(e.code == 'ENTER'){
        var URL = processEnteredUrl(This.URLField.getText());
        runLater(function(){
          This.load(URL);
        });
      }
    }
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

  This.canGoBack = function(){
    var history = This.engine.getHistory();
    var entryList = history.getEntries();
    var currentIndex = history.getCurrentIndex();
    return (currentIndex > 0);
  }

  This.canGoForward = function(){
    var history = This.engine.getHistory();
    var entryList = history.getEntries();
    var currentIndex = history.getCurrentIndex();
    return (currentIndex < entryList.size()-1);
  }

  This.saveHistory = function(){
    savedHistory.save(This.engine.getHistory());
  }

  This.showHistory = function(){
    savedHistory.display(This.engine.getHistory());
  }

  function runLater(func){
    if(typeof func == 'function'){
      Platform.runLater(func);
    }
  }

  function processEnteredUrl(strURL){
    var out;
    try{
      var URLObj = new URL(strURL);
      out = strUrl;
    }catch(e){
      var message = e.message.match(/no protocol: /);
      if(message){
        var split = e.message.split(':');
        if(split[1].match(/\.com|org|net|edu|to|biz$/)){
          out = 'http://' + split[1].replace(' ','');
        }else{
          out = 'http://google.com/search?q=' + split[1];
        }
      }
    }
    return out;
  }

  function setLocationListener(){
      This.engine.locationProperty().addListener(new ChangeListener(){
          changed: function(value, oldloc, newloc){
            This.emit('CHGLOCATION',newloc);
          }
      });
  }
}


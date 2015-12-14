var OpenOption = Java.type("java.nio.file.StandardOpenOption");
var Files = Java.type("java.nio.file.Files");
var Paths = Java.type("java.nio.file.Paths");
var BufferedReader = Java.type("java.io.BufferedReader");
var InputStreamReader = Java.type("java.io.InputStreamReader");
Utility = {
  dialog:function(type,text){
    if(type != "PROMPT"){
      var Alert = javafx.scene.control.Alert
      var box = new Alert(type);
      switch(type){
        case Alert.AlertType.INFORMATION:
        case Alert.AlertType.ERROR:
        case Alert.AlertType.WARNING:
          box.setTitle("Alert!");
          break;
        case Alert.AlertType.CONFIRMATION:
          box.setTitle("Confirm");
          break;
      }
      box.setContentText(text);
      var ret = box.showAndWait();
      if(type == Alert.AlertType.CONFIRMATION){
        ret = (ret.get() == javafx.scene.control.ButtonType.OK);
      }
    }else{
      var Alert = javafx.scene.control.TextInputDialog;
      var box = new Alert();
      box.setContentText(text);
      var ret = box.showAndWait();
      ret = ret.isPresent() ? ret.get() : "";
    }
    return ret
  },

  readFile: function(p){
    var outStr = '';
    var line;
    var path = Paths.get(p);
    try{
      input = Files.newInputStream(path);
      var reader = new BufferedReader(new InputStreamReader(input));
      while((line = reader.readLine()) != null){
        outStr += line;
      }

    }catch(e){
      print(e);
    }
    return outStr;
  },

  writeFile: function(content,p){
    var bytes = content.getBytes();
    var path = Paths.get(p);
    try{
      Files.write(path,bytes);
    }catch(e){
      print(e);
    }
  }
};
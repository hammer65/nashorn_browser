var OpenOption = Java.type("java.nio.file.StandardOpenOption");
var Files = Java.type("java.nio.file.Files");
var Paths = Java.type("java.nio.file.Paths");
var BufferedReader = Java.type("java.io.BufferedReader");
var InputStreamReader = Java.type("java.io.InputStreamReader");
Utility = {

  getControlById: function(collection,id){
    var arr = collection.getChildren().toArray();
    for each(i in arr){
      if(typeof i.id != 'undefined' && i.id != '' && id == i.id){
        return i;
      }
    }
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
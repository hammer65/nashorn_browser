function SavedHistory(){
  var path = "${home}/data/history.json";
  var data = [];
  load();

  this.save = function(currentHistory){
    var curr = Java.from(currentHistory.getEntries());
    var totLength = data.length + curr.length;
    if(totLength > historyLimit){
      data = data.slice((curr.length - data.length)-1);
    }
    var content = JSON.stringify(combine(curr));

    Utility.writeFile(content,path);
  }

  this.display = function(currentHistory){
    var hspacing = 8;
    var vspacing = 10;
    var titleW = 200;
    var urlW = 550;
    var dateW = 300;
    var items = currentHistory.getEntries();
    var stage = new Stage();
    var tbl = new VBox();
    tbl.setSpacing(vspacing);
    tbl.getStyleClass().add("vbox");
    var currLabel = new Label("This Session");
    var header = new HBox();
    header.getStyleClass().add("tbl-header");
    header.setSpacing(hspacing);
    header.getChildren().addAll(
      historyCell("Title",titleW),
      historyCell("Url",urlW),
      historyCell("date",dateW)
    );
    tbl.getChildren().addAll(currLabel,header);
    var row;
    var lnk;
    stage.setTitle("History");
    for(var i = 0;i < items.length;i++){
      lnk = new Hyperlink();
      lnk.setText(items[i].url);
      lnk.onAction = function(e){
        print(e);
      }
      row = new HBox();
      row.setSpacing(hspacing);
      row.getStyleClass().add("hbox");
      row.getChildren().addAll(
        historyCell(items[i].title,titleW),
        historyCell(lnk,urlW),
        historyCell(items[i].date,dateW)
      );
      tbl.getChildren().add(row);
    }

    for(i = 0;i < data.length;i++){
      lnk = new Hyperlink();
      lnk.setText(data[i].url);
      lnk.onAction = function(e){
        print(e);
      }
      row = new HBox();
      row.getStyleClass().add("hbox");
      row.getChildren().addAll(
        historyCell(data[i].title,titleW),
        historyCell(lnk,urlW),
        historyCell(data[i].date,dateW)
      );
      tbl.getChildren().add(row);
    }
    var scrollPane = new ScrollPane();
    scrollPane.setContent(tbl);
    var scene = new Scene(scrollPane,1000,650);
    scene.getStylesheets().add("file://${css_dir}history.css");
    stage.setScene(scene);
    stage.show();
  }

  function historyCell(text,width){
    var ret = new HBox();
    text = typeof text == 'undefined'? '' : text;
    var content = text;
    ret.setPrefWidth(width);
    ret.getStyleClass().add("cell");
    if(typeof text == 'string'){
      content = new Text(text);
    }
    ret.getChildren().add(content);
    return ret;
  }

  function combine(current){
    var out = [];
    for(var i = 0;i < current.length;i++){
      out[i] = {
        url: current[i].url,
        title: current[i].title,
        date: current[i].date
      }
    }
    return out.concat(data);
  }

  function load(){
    var raw = Utility.readFile(path);
    if(raw != ''){
      data = JSON.parse(raw);
    }
  }
}
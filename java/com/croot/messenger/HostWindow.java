package com.croot.messenger;

import java.util.ArrayList;

import javafx.beans.value.ChangeListener;

import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker.State;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.*;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class HostWindow extends Stage{
  interface Bridge{
    public void send(String URLstr);
  }
  
  private final WebView browser = new WebView();
  private WebEngine engine;
  private String path;
  
  public HostWindow(String fpath){
    path = fpath;
    engine = browser.getEngine();
    engine.setJavaScriptEnabled(true);
    
    engine.getLoadWorker().stateProperty().addListener(new ChangeListener<State>(){

      @Override
      public void changed(ObservableValue<? extends State> observable, State oldValue, State newValue) {
        if(newValue == State.SUCCEEDED){
          JSObject jsobject = (JSObject) engine.executeScript("window");
          jsobject.setMember("HOST",new Bridge(){
              @Override
              public void send(String str){
                System.out.println(str);
              }
          });
        }
      }
    });
  
  assemble();
    load(path);
  }
  
  private void assemble(){
    VBox box = new VBox();
    box.getChildren().add(browser);
    Scene scene = new Scene(box);
    setScene(scene);
  }
  
  private void load(String url){
    engine.load(url);
  }
}

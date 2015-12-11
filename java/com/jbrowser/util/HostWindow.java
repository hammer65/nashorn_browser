package com.jbrowser.util;

import java.util.ArrayList;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker.State;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.*;
import javafx.stage.Stage;
import netscape.javascript.JSObject;
import java.util.HashMap;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.events.*;

public class HostWindow extends Stage{
  interface Bridge{
    public void send(String URLstr);
  }
  
  public static final String EVENT_TYPE_CLICK = "click";
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
            EventListener listener = new EventListener(){
              @Override
              public void handleEvent(org.w3c.dom.events.Event evt) {
                String etype = evt.getType();
                if(etype.equals(EVENT_TYPE_CLICK)){
                   String cmd = ((Element)evt.getTarget()).getAttribute("data-cmd");
                   // to do split cmd and if it's a history link get the href and send an event
                   System.out.println(dtext);
                }
              }
            };
          
          Document doc = engine.getDocument();
          NodeList list = doc.getElementsByTagName("a");
          for(int i = 0;i < list.getLength();i++){
            EventTarget targ = (EventTarget) list.item(i);
            targ.addEventListener(EVENT_TYPE_CLICK, listener, false);
          }
        }
      }
    });
  
    assemble();
    load(path);
  };

  public void execJS(String eventName, String payload){
    engine.executeScript(
      "var ev = new CustomEvent('" + eventName + "',{detail:"  + payload + "});" +
      "document.dispatchEvent(ev);"
    );
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

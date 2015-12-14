package com.jbrowser.util;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker.State;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.*;
import javafx.stage.Stage;
import netscape.javascript.JSObject;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.events.*;

public class HostWindow extends Stage{
  public interface CommandListener{
    public void exec(HashMap<String, Object> payload);
  }
  
  public static final String EVENT_TYPE_CLICK = "click";
  public static final String EVENT_TYPE_KEYUP = "keyup";
  public static final String EVENT_TYPE_CHANGE = "change";
  public static final String EVENT_TYPE_SUBMIT = "submit";
  private final WebView browser = new WebView();
  private List<CommandListener>  listeners = new ArrayList<CommandListener>();
  private WebEngine engine;
  private String path;
  
  public HostWindow(String fpath,Stage owner){
    path = fpath;
    initOwner(owner);
    engine = browser.getEngine();
    engine.setJavaScriptEnabled(true);
    
    engine.getLoadWorker().stateProperty().addListener(new ChangeListener<State>(){

      @Override
      public void changed(ObservableValue<? extends State> observable, State oldValue, State newValue) {
        if(newValue == State.SUCCEEDED){
            System.out.println("Succeeded");
            EventListener listener = new EventListener(){
              @Override
              public void handleEvent(org.w3c.dom.events.Event evt) {
                String cmd = ((Element)evt.getTarget()).getAttribute("data-cmd");
                if(cmd != null){
                  String[] parts = cmd.split("/");
                  List<String> vals = new ArrayList<String>();
                  for(int i = 2;i < parts.length;i++){
                    vals.add(parts[i]);
                  }
                  HashMap<String, Object> payload = new HashMap<String, Object>();
                  payload.put("element",parts[0]);
                  payload.put("function",parts[1]);
                  payload.put("values",vals);
                  for(CommandListener cl : listeners){
                    cl.exec(payload);
                  }
                }
              }
            };
          
          EventTarget doc = (EventTarget) engine.getDocument();
          doc.addEventListener(EVENT_TYPE_CLICK, listener, false);
          doc.addEventListener(EVENT_TYPE_KEYUP, listener, false);
          doc.addEventListener(EVENT_TYPE_CHANGE, listener, false);
          doc.addEventListener(EVENT_TYPE_SUBMIT, listener, false);
        }
      }
    });
  
    assemble();
    load(path);
  };

  public void addCommandListener(CommandListener l){
    listeners.add(l);
  }

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

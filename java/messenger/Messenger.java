package com.croot.messenger;

import java.util.ArrayList;

import javafx.event.EventHandler;
import javafx.scene.web.*;
import netscape.javascript.JSObject;

public class Messenger {
  interface Bridge{
    public void send(String URLstr);
  }
  
 private ArrayList<MessageListener> listeners = new ArrayList<MessageListener>();
 private final WebView webview = new WebView;
  
  public Messenger(){
      
  }

  public WebView getWebView(){
    return webview;
  }
  
  public void registerHost(){
    JSObject jsobj = (JSObject) engine.executeScript("window");
	jsobj.setMember("HOST", new Bridge(){
	  public void send(String msg){
		hostMessage(msg);
	  }
	});
  }
  
  public void addListener(MessageListener m){
	listeners.add(m);
  }
  
  public Object docMessage(String msg){
	String script = "e = CustomEvent('HOST',{detail:'" + msg + "')";
    
	return engine.executeScript(script);
  }
  
  private void hostMessage(String msg){
	for(MessageListener m:listeners){
	  m.event(msg);
	}
  }
}
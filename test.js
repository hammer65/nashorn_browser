#!/usr/bin/jjs -Dnashorn.args=-fx -cp ./java
// Get java stuff
var Scene = Java.type("javafx.scene.Scene");
var m = Java.type("com.croot.messenger.Messenger");
var w = new m();
var engine = m.getEngine();
print(engine);
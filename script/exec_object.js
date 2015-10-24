ExecObject = function(){
	this.changeLabel = function(args){
		print(typeof this.color);
		print(typeof this.text);
		if(typeof this.color != 'undefined'){
			tLabel.setTextFill(Color.web(this.color));
		}
		if(typeof this.text != 'undefined'){
			tLabel.setText(this.text);
		}
	}
	this.warning = function(){
		var data = {
			text: this.text,
			title: "Warning!!"
		}
		dialog(data,Alert.AlertType.WARNING);
	}
	this.productFormSubmit = function(){
		var lookup = [null,"Home","Auto"]
		var data = {
			"First Name": this.first_name,
			"Last Name": this.last_name,
			"Product": lookup[this.product]
		};
		resultWindow(data);
	}
	this.console = function(msg){
		print(this.text);
	}
};
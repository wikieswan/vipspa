requirejs(['add'],function(add){
	var sum = add(1,2);
	console.log(sum);
	function Model(){
		var self = this;
		self.name = ko.observable('Jack');
	}
	var model = new Model();
	ko.applyBindings(model,$('#home')[0]);
	
});
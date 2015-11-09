define([], function () {
	var Trace = function(text,fn){
	    this.obj = 	$('<div class="gl-trace">'+text+'</div>');
	    this.fn = fn;
	};

	Trace.prototype = {
	    show : function(){
	        var _this = this;
	        var _obj = this.obj;
	        _obj.appendTo("body").show();
	    },
	    hide : function(){
	        var _fn = this.fn;
	        var _obj = this.obj;
	        _obj.hide();
	        _obj.remove();
            if(_fn){
                _fn();
            }
	    }
	};
    return function(text,fn,myTime){
        myTime = myTime || 3000;
	    var trace = new Trace( text,fn );
	    trace.show();
	    var timeout = setTimeout( function(){
	        trace.hide();
	        clearTimeout(timeout);
	    },myTime );
    };
});
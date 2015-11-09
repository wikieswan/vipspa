
(function(){

    //router
    function KoRouter(routerMap,mainView){
        this.routerMap = routerMap;
        this.mainView = mainView;
    }

    KoRouter.prototype.start = function(){
        var self = this;
        self.startRouter();
        window.onhashchange = function(){
            self.startRouter();
        };
    }

    KoRouter.prototype.routerAction = function(routeObj){
        var self = this;
        var routerItem = self.routerMap[routeObj.url];
        if(typeof routerItem==='undefined'){
            var defaultsRoute = self.routerMap.defaults
            routerItem = self.routerMap[defaultsRoute];
            location.hash = defaultsRoute;
            return false;
        }
        
        $(self.mainView).load(routerItem.templateUrl,routeObj.param,function(){
            loadScript(routerItem.controller);
        });
    }
   
    KoRouter.prototype.startRouter = function  () {
        var self = this;
    	var hash = location.hash;
       	var routeObj = hashAnalysis(hash);
       	self.routerAction(routeObj);
    }
    
    
    function hashAnalysis(hash){
    	var obj = {
    		url:'',
    		param: {}
    	};
    	var param = {},url='';
    	var pIndex = hash.indexOf('?');
    	if(hash===''){
    		return obj;
    	}

    	if(pIndex>-1){//? 有参数
    		url = hash.substring(1,pIndex)
    		var paramStr = hash.substring(pIndex+1);
    		var paramArr = paramStr.split('&');
    		
    		$.each(paramArr,function(i,e){
    			var item = e.split('='),
	    			key,
	    			val;
    			key = item[0];
    			val = item[1];
    			if(key!=''){
					param[key] = val;
    			}
    			

    		});
    	}
    	else{
    		url = hash.substring(1)
    		param = {};
    	}
    	return {
    		url:url,
    		param: param
    	}
    }
    function loadScript(src, callback) {
    	$('.scriptDom').remove();
	    var script = document.createElement('script'),
	        loaded;
	    script.setAttribute('src', src);
	    script.setAttribute('class', 'scriptDom');
	    if (callback) {
	      script.onreadystatechange = script.onload = function() {
	        if (!loaded) {
	          callback();
	        }
	        loaded = true;
	      };
	    }
	    var head = document.getElementsByTagName("head")[0];
	    (head || document.body).appendChild(script);
	}

    window.KoRouter = KoRouter;
})();
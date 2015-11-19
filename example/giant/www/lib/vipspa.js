(function(){

    function Vipspa(){
        
    }


    Vipspa.prototype.start = function(config){
        var self = this;
        self.routerMap = config.router;
        self.mainView = config.view;
        startRouter();
        window.onhashchange = function(){
            startRouter();
        };
    }
    var messageStack = [];

    // {
    //     'id': 'home_bindcard',
    //     'content': {
    //     }
    // }
    Vipspa.prototype.getMessage = function(id){
        var msg = {};
        $.each(messageStack,function(i,e){
            if(e.id===id){
                msg = e;
            }
        });
        return msg;
    }

    Vipspa.prototype.setMessage = function(obj){
        var _obj = JSON.parse(JSON.stringify(obj));
        $.each(messageStack,function(i,e){
            if(e.id===_obj.id){
                e = _obj;
                return false;
            }
        })
        messageStack.push(_obj);
    }
    
    Vipspa.prototype.stringify = function(routerUrl,paramObj){
        var paramStr='' ,hash;
        for(var i in  paramObj){
            paramStr += i + '=' + encodeURIComponent(paramObj[i]) + '&';
        }
        if(paramStr === ''){
            hash = routerUrl;
        }
        else{
            paramStr = paramStr.substring(0,paramStr.length-1);
            hash = routerUrl + '?' + paramStr;
        }
        return hash;
    }
    Vipspa.prototype.parse = function(routerHash){
        var hash = typeof routerHash ==='undefined'?location.hash:routerHash;
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
                    param[key] = decodeURIComponent(val);
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
    function routerAction (routeObj){
        var routerItem = vipspa.routerMap[routeObj.url];
        if(typeof routerItem==='undefined'){
            var defaultsRoute = vipspa.routerMap.defaults
            routerItem = vipspa.routerMap[defaultsRoute];
            location.hash = defaultsRoute;
            return false;
        }
        
        $.ajax({
            type: 'GET',
            url: routerItem.templateUrl,
            dataType: 'html',
            success: function(data, status, xhr){
                $(vipspa.mainView).html(data);
                loadScript(routerItem.controller);
            },
            error: function(xhr, errorType, error){
                var errHtml = $('#error').html();
                errHtml = errHtml.replace(/{{errStatus}}/,xhr.status);
                errHtml = errHtml.replace(/{{errContent}}/,xhr.responseText);
                $(vipspa.mainView).html(errHtml);
            }
        });
    }
   
    function startRouter  () {
        var hash = location.hash;
        var routeObj = vipspa.parse(hash);
        routerAction(routeObj);
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

    window.vipspa = new Vipspa();
})();
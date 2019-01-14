(function(){
    function Vipspa(){
        
    }
    Vipspa.prototype.start = function(config){
        var self = this;
        self.routerMap = config.router;
        self.mainView = config.view;
        self.errorTemplateId = config.errorTemplateId;
        self.catchHtmls = [];
        startRouter();
        window.onhashchange = function(){
            startRouter();
        };
    };
    var messageStack = [];
    var OLD_ROUTER = null;
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
    };

    Vipspa.prototype.setMessage = function(obj){
        var _obj = JSON.parse(JSON.stringify(obj));
        $.each(messageStack,function(i,e){
            if(e.id===_obj.id){
                e = _obj;
                return false;
            }
        });
        messageStack.push(_obj);
    };
    Vipspa.prototype.delMessage = function(id){
        if(typeof id==='undefined'){
            return false;
        }
        var index = 0;
        $.each(messageStack,function(i,e){
            if(e.id===id){
                index = i;
            }
        });
        $.each(messageStack,function(i,e){
            if(i>index){
                messageStack[i-1] = e;
            }
        });
    };
    Vipspa.prototype.clearMessage = function(id){
        var index = 0;
        messageStack = [];
    };
    
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
    };
    
    //var str = '#parent/child?param=val'; getHashPathAndParams(str)
    function getHashPathAndParams (hash) {
        if (hash === '') return false;

        var hashval = hash.substr(1);
        var pIndex = hashval.indexOf('?');

        var param = {};
        var path = '';

        if (pIndex>-1){ // 
            var urlAndQueryArr = hashval.split('?');
            path = urlAndQueryArr[0]
            var quertString = urlAndQueryArr[1];
            param = getParamsFromQuerystring(quertString);
        } else {
            path = hashval;
            param = {}
        }
        var routers = path.split('\/');
        return {
            path: path,
            routers: routers,
            param: param
        }

    }
    // var str = 'a=1&b=2'; getParamsFromQuerystring(str)
    function getParamsFromQuerystring(quertString) {
        var paramArr = quertString.split('&');
        var param = {};
        paramArr.forEach(function(e){
            var item = e.split('='),
                key,
                val;
            key = item[0];
            val = item[1];
            if(key!==''){
                param[key] = decodeURIComponent(val);
            }
        });
        return param;
    }

    //#parent/child?param=val
    Vipspa.prototype.parse = function(routerHash){
        var hash = typeof routerHash ==='undefined'?location.hash:routerHash;
        var obj = {
            url:'',
            param: {}
        };
        var hashPathAndParams = getHashPathAndParams(hash)

        return hashPathAndParams
    };
    function routerAction (hashPathAndParams ){
        var path = hashPathAndParams.path;
        var routers = hashPathAndParams.routers;
        var param = hashPathAndParams.param;
        
        // 空路由
        if(!hashPathAndParams){
            var defaultsRoute = vipspa.routerMap.defaults;
            var routerItem = vipspa.routerMap[defaultsRoute];
            loaderHtml(vipspa.mainView, routerItem);
            location.hash = defaultsRoute;
            return false;
        }

        // 普通一级路由
        if (routers.length === 1) {
            var url = routers[0];
            var routerItem = vipspa.routerMap[url];
            if(typeof routerItem==='undefined'){
                console.error('路由匹配失败，请检查。',hashPathAndParams)
                return false;
            }

            if (OLD_ROUTER === null) {
                loaderHtml(vipspa.mainView, routerItem);
                OLD_ROUTER = hashPathAndParams
                return false
            }

            var hasParentRouterChange = OLD_ROUTER.routers[0] !== hashPathAndParams.routers[0]
            if (hasParentRouterChange) {
                loaderHtml(vipspa.mainView, routerItem)
            } else {
                var url = OLD_ROUTER.routers[0];
                var subUrl = OLD_ROUTER.routers[1];

                var subView = routerItem.subView;
                var children = routerItem.children;
                var subRouterItem = getSubRouterItem(children, subUrl);

                loaderHtml(subView, {}, function(){}, true)
            }

            OLD_ROUTER = hashPathAndParams
        }
        // 二级嵌套路由
        else if (routers.length === 2) {
            var hasParentRouterChange = true
            if (OLD_ROUTER === null) {
                OLD_ROUTER = hashPathAndParams
            } else {
                hasParentRouterChange = OLD_ROUTER.routers[0] !== hashPathAndParams.routers[0]
                OLD_ROUTER = hashPathAndParams
            }

            var url = routers[0];
            var subUrl = routers[1];

            var routerItem = vipspa.routerMap[url];

            if(typeof routerItem==='undefined'){
                console.error('路由匹配失败，请检查。',hashPathAndParams)
                return false;
            }

            var subView = routerItem.subView;
            var children = routerItem.children;

            var subRouterItem = getSubRouterItem(children, subUrl);
            
            if(typeof routerItem==='undefined'){
                console.error('子路由匹配失败，请检查。',hashPathAndParams)
                return false;
            }

            if (hasParentRouterChange) {
                loaderHtml(vipspa.mainView, routerItem, function() {
                    loaderHtml(subView, subRouterItem)
                })
            } else {
                loaderHtml(subView, subRouterItem)
            }
        } else {
            // 暂时未实现
        }

    }

    function getSubRouterItem(children, subRouterName) {
        var subRouter = null;
        children.forEach(function(e) {
            if (e.name === subRouterName) {
                subRouter = e;
            }
        })
        return subRouter;
    }

    // 向dom中写入指定的html 或者清空
    function loaderHtml(domId, routerItem, cb, clearable) {
        if (clearable) {
            clearDomHtmlContent(domId)
            return
        }
        var isExitCatch = isRouterUrlExitsInCatchHtmls(routerItem.templateUrl);
        if (isExitCatch) {
            loadPageHtmlFromCatch(domId, routerItem, cb);
        } else {
            fetchHtmlFromServer(domId, routerItem, cb);
        }
    }

    function clearDomHtmlContent(domId) {
        $(domId).html('')
    }

    function fetchHtml(url, cbSuccess, cbFail) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'html',
            success: function(data, status, xhr){
                cbSuccess && cbSuccess(data);
            },
            error: function(xhr, errorType, error){
                cbFail && cbFail()
                if($(vipspa.errorTemplateId).length===0){
                    return false;
                }
                var errHtml = $(vipspa.errorTemplateId).html();
                errHtml = errHtml.replace(/{{errStatus}}/,xhr.status);
                errHtml = errHtml.replace(/{{errContent}}/,xhr.responseText);
                $(vipspa.mainView).html(errHtml);
            }
        });
    }

    function fetchHtmlFromServer(domId, routerItem, cb) {
        fetchHtml(routerItem.templateUrl, function(data) {
            $(domId).html(data);
            loadScript(routerItem.controller);
            saveHtmlsToCatch(routerItem.templateUrl, data);
            cb && cb();
        })
    }

    function loadPageHtmlFromCatch(domId, routerItem, cb) {
        var htmls = getHtmlsFromCatch(routerItem.templateUrl);
        $(domId).html(htmls);
        loadScript(routerItem.controller);
        cb && cb();
    }
    function getHtmlsFromCatch(routerUrl) {
        for(var i=0,e;i<vipspa.catchHtmls.length;i++) {
            e = vipspa.catchHtmls[i];
            if (e.routerUrl === routerUrl) {
                return e.htmls;
            }
        }
        return '';
    }

    function saveHtmlsToCatch(routerUrl, htmls) {
        var obj = {
            routerUrl: routerUrl,
            htmls: htmls,
        };
        vipspa.catchHtmls.push(obj);
    }

    function isRouterUrlExitsInCatchHtmls(routerUrl) {
        for(var i=0,e;i<vipspa.catchHtmls.length;i++) {
            e = vipspa.catchHtmls[i];
            if (e.routerUrl === routerUrl) {
                return true;
            }
        }
        return false;
    }
   
    function startRouter  () {
        var hash = location.hash;
        var routeObj = vipspa.parse(hash);
        routerAction(routeObj);
    }
    
    function loadScript(src, callback) {
        var script = document.createElement('script'),
            loaded;
        script.setAttribute('src', src);
        script.onreadystatechange = script.onload = function() {
            script.onreadystatechange = null;
            document.documentElement.removeChild(script);
            script = null;
            if (!loaded) {
                if(typeof callback==='function')
                    callback();
            }
            loaded = true;
        };
        document.documentElement.appendChild(script);
    }

    window.vipspa = new Vipspa();
})();
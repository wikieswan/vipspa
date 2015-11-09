requirejs.config({
    baseUrl: '/js/public/cashier-v1.0/h5/mod',
    urlArgs: '1.0.0',
    paths: {
    	domReady: '../../../requirePlugin/domReady',
        pub : '../../pub'
    },
    shim: {
    }
});
var isDebuge = true;
var domain = '//127.0.0.1:8888/',
	route = isDebuge?'testapi':'api';
$(function(){
	var	routerMap = {
		'defaults': 'home', //默认路由
    	'home': {
    		templateUrl: '/views/home.html',
    		controller: '/js/public/cashier-v1.0/h5/app/home.js'
    	},
    	'message':{
    		templateUrl:'/views/message.html',
    		controller:'/js/public/cashier-v1.0/h5/app/message.js'
    	},
    	'bindcard':{
    		templateUrl:'/views/bindcard.html',
    		controller:'/js/public/cashier-v1.0/h5/app/bindcard.js'
    	}
    };
    var koRouter = new KoRouter(routerMap,'#ui-view');
    koRouter.start();

});

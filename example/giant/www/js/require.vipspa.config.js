requirejs.config({
    baseUrl: 'js/mod',
    urlArgs: '1.0.0',
    paths: {
    	
    },
    shim: {

    }
});

$(function(){
	vipspa.start({
        view: '#ui-view',
        router: {
            'home': {
                templateUrl: 'views/home.html',
                controller: 'js/app/home.js'
            },
            'content': {
                templateUrl: 'views/content.html',
                controller: 'js/app/content.js'
            },
            'contact': {
                templateUrl: 'views/contact.html',
                controller: 'js/app/contact.js'
            },
            'defaults': 'home' //默认路由
        }
    });

});

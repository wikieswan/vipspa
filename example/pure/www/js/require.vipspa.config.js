$(function(){
	vipspa.start({
        view: '#ui-view',
        errorTemplateId: '#error', // 可选
        router: {
            'home': {
                templateUrl: 'views/home.html',
                controller: 'js/app/home.js',
            },
            'content': {
                templateUrl: 'views/content.html',
                controller: 'js/app/content.js'
            },
            'contact': {
                templateUrl: 'views/contact.html',
                controller: 'js/app/contact.js'
            },
            'user': {
                templateUrl: 'views/user.html',
                controller: 'js/app/user.js',
                subView: '#ui-sub-view',
                children: [
                    {
                        name: 'login',
                        templateUrl: 'views/login.html',
                        controller: 'js/app/login.js',
                    },
                    {
                        name: 'regist',
                        templateUrl: 'views/regist.html',
                        controller: 'js/app/regist.js',
                    }
                ]
            },
            'defaults': 'home' //默认路由
        }
    });

});

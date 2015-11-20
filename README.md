# vipspa
a spa framework 

## api

### 1 start(config)

作用 ： 配置SPA路由信息

参数 ： config

```javascript
	{
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
    }
```    

参数解释

1 view
```javascript
	config.view = '#ui-view'
```  
index.html中展示view视图的div（jquery DOM）。

2 router
```javascript
	config.router = {
		'home': {
	        templateUrl: 'views/home.html',
	        controller: 'js/app/home.js'
	    },
	    'defaults': 'home' //默认路由
	}
```  
router里面配置所有的路由信息，```'defaults'``` 用来设置默认路由，即不在路由规则里面的路由将展示 ```'defaults'``` 的view。
针对其中的某个路由，比如 ```'home'``` ，需要两个值，分别是 ```templateUrl``` 、```controller``` 。```templateUrl``` 指向对应的view页面路径，是一个html片段；```controller```指向视图的js逻辑代码路径。

通过以上信息，vipspa就可以知道每个视图对应的html片段和js代码，以及如果对于不在路由规则内的路由的处理方式。

### 2 stringify(hash,param)

作用：根据 hash 和 param 生成完整的hash串，为view间跳转传参准备。
参数：hash —— 某个view的路由配置信息，比如 ```'home'```；param —— 需要传递的参数，一个对象类型的值，比如 {name:'Jack'}
使用场景：浏览器url传参是使用。
用法：

```javascript
	//跳转到 home 页面，同时像 home传递参数 {name:'Jack'}
	location.hash = stringify('home',{name:'Jack'});
```  
### 3 parse(hashStr)
作用：根据完整的hash串，解析出来 hash 和 param ，是stringify 的逆操作，为view间跳转解析参数准备。
参数：hashStr —— 完整的hash串，比如 ```home?name=Jack&age=18``` .如果参数为空，默认取当前浏览器的hash
使用场景：浏览器url解析参数使用。
用法：
```javascript
	//假如当前浏览器url地址是 localhost:8080/#home?name=Jack&age=18
	var obj = vipspa.parse();
	console.log(obj);
	/**
	{
		param: {
			name: "Jack",
			age:'18'
		},
		url: "home"
	}
	**/
```
### 4 getMessage
### 5 setMessage
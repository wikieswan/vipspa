# vipspa

一个微型的SPA框架，只有2kB！依赖zepto或者jquery。

## 目标

市面上有大量的SPA框架，有大而全的Angularjs、自定义很强的Backbonejs等。对于追求极致小得移动端来说，
都比较大，重！

鉴于此，开发了一个微型的SPA框架。框架只提供路由控制和几个简单的传参API，具体的代码组织完全自主化。

你可以用requirejs做模块化开发，然后rjs或者webpacket打包。当然seajs也可以的！选择你熟悉的。

你可以用knockoutjs、reactjs、vuejs等mvvm库做双向绑定。对于复杂的项目来说这是有必要的，代码量会下降很多，代码可维护性更强。你熟悉那个就用选择哪个。

至于UI，你想怎么写都可以。

项目有两个例子，在example/下，分别是pure、giant。两个例子都基于gulp，下载下来后，3步可以看效果：

    1 cd pure 

    2 npm install

    3 gulp 

ps：如果对gulp不熟悉，请把项目文件放入任何静态服务器，如Apache、nginx等。

pure 是个不引入其他库（require或者mvvm库），它是一个纯vipspajs 构建的单页面应用。

giant 是一个配合requirejs和knockoutjs做的一个例子。

## 快速开始

html代码

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" >
    <title>vipspa demo</title>
</head>
<body>
    <ul>
        <li><a href="#home">首页</a></li>
        <li><a href="#content">公司简介</a></li>
        <li><a href="#contact">联系我们</a></li>
    </ul>
    <div id="ui-view"></div><!--view区域，必须，id可以随意起，但是需要和js配置代码一致-->
    <script type="text/html" id="error">
        <!--可以自定义错误信息,可选，定义一些404页面等-->
        <div>
            {{errStatus}}
        </div>
        <div>
            {{errContent}}
        </div>
    </script>
    
    <script type="text/javascript" src="lib/zepto-1.1.4.min.js"></script>
    <script type="text/javascript" src="lib/vipspa.min.js"></script>
    <script type="text/javascript">
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
    </script>
</body>
</html>
```

接下来只要关注写 'views/home.html' 'js/app/home.js' 的业务代码就好了。

## API

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

参数：hashStr —— 完整的hash串，比如 ```home?name=Jack&age=18``` .如果参数为空，默认取当前浏览器的hash.

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
			age:"18"
		},
		url: "home"
	}
	**/
```


### 4 setMessage(param)

作用：向消息队列中加入一条消息。

参数：消息体的格式

```javascript
 {
    'id': 'home_msg',
    'content': {
    	name: "Jack",
		age:"18"
    }
 }
```
id  消息的唯一id

content 消息的具体内容，存放参数的地方


使用场景：在不允许暴漏参数的地方，可以用这种方式进行内存传参。

用法：

```javascript
//隐式向 home 页面传递参数
var msg = {
    'id': 'home_msg',
    'content': {
    	name: "Jack",
		age:"18"
    }
};
vipspa.setMessage(msg);
location.hash = 'home';

```


### 5 getMessage(messageId)

作用：解析 setMessage 接口传递的消息。

参数： 消息id

使用场景：在不允许暴漏参数的地方，可以用这种方式进行解析内存参数。

用法

```javascript
//隐式向 home 页面传递参数
var msg = {
    'id': 'home_msg',
    'content': {
    	name: "Jack",
		age:"18"
    }
};
var param = vipspa.getMessage('home_msg');
console.log(param);

/**
{
    'id': 'home_msg',
    'content': {
    	name: "Jack",
		age:"18"
    }
}
**/

```

### delMessage(messageId)

作用：删除指定消息


### clearMessage()

作用：清楚消息队列









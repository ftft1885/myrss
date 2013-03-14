var myrss = require('./myrss.js');

//var url = "http://ftft1885.sinaapp.com";
//var url = "http://blog.sina.com.cn/u/1898535715";
//var url = "http://blog.farbox.com";
var url = "http://cn.engadget.com/";
////var url = "http://www.cnblogs.com/HD/archive/2006/10/11/526173.html";

myrss(url,function(result){
	console.log(result);
})
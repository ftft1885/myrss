var http = require('http');
var path = require('path');
var URL = require('url');
var parseString = require('xml2js').parseString;

module.exports = function(url,callback){
	getRSS(url,function(result){		
		for(var key in result){
			console.log(key);
		}
	})
}

function getRSS(url,callback){
	get_rss_xml(url,function(xml){	
		var type = '';
		if(xml.rss && xml.rss['$'] && xml.rss['$'].version == '2.0'){
			type = '2.0';
		}
		if(xml.feed && xml.feed['$'] && [xml.feed['$'].xmlns] && xml.feed['$'].xmlns.toLowerCase().indexOf('atom') !== -1){
			type = 'atom';
		}
		var result;
		switch(type){
			case '2.0': 			
				result = {
					title: xml.rss.channel[0].title,
					link: xml.rss.channel[0].link,				
					posts: xml.rss.channel[0].item
				}
				break;
			case 'atom':
				//console.log(xml.feed);
				result = {
					title: xml.feed.title,
					link: xml.feed.link,
					posts: xml.feed.entry
				}
				break;
		}	
		if(typeof result.link !== 'string'){
			result.link = url;
		}
		
		for(var i = 0; i < result.posts.length; i++){
			for(var key in result.posts[i]){
				if(typeof result.posts[i][key] === 'object'){
					result.posts[i][key] = result.posts[i][key][0];
				}
				if(key === 'link'){
					if( result.posts[i]['link']['$'] && result.posts[i]['link']['$'].href){
						result.posts[i]['link'] = result.posts[i]['link']['$'].href;
					}
				}
			}
		}		
		callback(result);
	});
}

function get_rss_xml(url,callback){
	get_rss_url(url,function(rss_url){		
		getHTML(rss_url,function(xml){
			//console.log(xml);
			parseString(xml,function(err,result){
				if(err)console.log(err);
				callback(result);
			})
		})		
	});	
}

function get_rss_url(url,callback){
	var result = [];
	getHTML(url,function(html){
		var htmlarr = html.split('\n');
		for(var i = 0; i < htmlarr.length; i++){
			if(htmlarr[i].indexOf('<link') !== -1){
				var line = htmlarr[i].toLowerCase();
				if(line.indexOf('rss') !== -1){
					var linearr = line.split(' ');
					linearr.forEach(function(l){
						if(l.indexOf('href') !== -1){
							var larr = l.split('"');
							if(larr.length === 1){
								larr = l.split('\'');
							}						
							result.push(larr[1]);
						}
					});
				
				}
			}
		}	
		var min = 99;	
		var rss_url = null;
		result.forEach(function(x){
			if(x.length < min){
				min = x.length;
				rss_url = x;
			}
		});
		if(rss_url.indexOf('http://') === -1){//relative path
			rss_url = url + rss_url;
		}
		//console.log(rss_url);
		callback(rss_url);
	});
}

function getHTML(url,callback){
	var hostname = URL.parse(url).hostname;	
	var pathname = URL.parse(url).path;
	var opts = {
		hostname: hostname,
		path: pathname,
		method: 'GET'
	}
	//console.log(opts);
	var html = "";
	var req = http.request(opts,function(res){
		res.on('data',function(data){
			html += data;
		});
		res.on('end',function(){		
			callback(html);
		});
	});
	req.end();
}
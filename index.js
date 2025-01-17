if (!Ylmf) {
	var Ylmf = {};
}
if (!Ylmf.M) Ylmf.M = {};
if (!Ylmf.D) Ylmf.D = {};
Ylmf.C = {
	$ID: function(id) {
		return "string" == typeof id ? document.getElementById(id) : id;
	},
	Browser: (function(ua) {
		var b = {
			msie: /msie/.test(ua) && !/opera/.test(ua),
			opera: /opera/.test(ua),
			safari: /webkit/.test(ua) && !/chrome/.test(ua),
			firefox: /firefox/.test(ua),
			chrome: /chrome/.test(ua)
		};
		var vMark = "";
		for (var i in b) {
			if (b[i]) {
				vMark = "safari" == i ? "version" : i;
				break;
			}
		}
		b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";
		b.ie = b.msie;
		b.ie6 = b.msie && parseInt(b.version, 10) == 6;
		b.ie7 = b.msie && parseInt(b.version, 10) == 7;
		b.ie8 = b.msie && parseInt(b.version, 10) == 8;
		b.ie9 = b.msie && parseInt(b.version, 10) == 9;
		return b;
	})(window.navigator.userAgent.toLowerCase()),
	Event: (function() {
		var addEvent, removeEvent, guid = 1,
			storage = function(element, type, handler) {
				if (!handler.$$guid) handler.$$guid = guid++;
				if (!element.events) element.events = {};
				var handlers = element.events[type];
				if (!handlers) {
					handlers = element.events[type] = {};
					if (element["on" + type]) {
						handlers[0] = element["on" + type];
					}
				}
			};
		if (window.addEventListener) {
			var fix = {
				"mouseenter": "mouseover",
				"mouseleave": "mouseout"
			};
			addEvent = function(element, type, handler) {
				if (type in fix) {
					storage(element, type, handler);
					var fixhandler = element.events[type][handler.$$guid] = function(event) {
							var related = event.relatedTarget;
							if (!related || (element != related && !(element.compareDocumentPosition(related) & 16))) {
								handler.call(this, event);
							}
						};
					element.addEventListener(fix[type], fixhandler, false);
				} else {
					element.addEventListener(type, handler, false);
				};
			};
			removeEvent = function(element, type, handler) {
				if (type in fix) {
					if (element.events && element.events[type]) {
						element.removeEventListener(fix[type], element.events[type][handler.$$guid], false);
						delete element.events[type][handler.$$guid];
					}
				} else {
					element.removeEventListener(type, handler, false);
				};
			};
		} else {
			addEvent = function(element, type, handler) {
				storage(element, type, handler);
				element.events[type][handler.$$guid] = handler;
				element["on" + type] = handleEvent;
			};
			removeEvent = function(element, type, handler) {
				if (element.events && element.events[type]) {
					delete element.events[type][handler.$$guid];
				}
			};

			function handleEvent() {
				var returnValue = true,
					event = fixEvent();
				var handlers = this.events[event.type];
				for (var i in handlers) {
					this.$$handleEvent = handlers[i];
					if (this.$$handleEvent(event) === false) {
						returnValue = false;
					}
				}
				return returnValue;
			};
		};
		var D = {
			getScrollTop: function(node) {
				var doc = node ? node.ownerDocument : document;
				return doc.documentElement.scrollTop || doc.body.scrollTop;
			},
			getScrollLeft: function(node) {
				var doc = node ? node.ownerDocument : document;
				return doc.documentElement.scrollLeft || doc.body.scrollLeft;
			}
		}

		function fixEvent(event) {
			if (event) return event;
			event = window.event;
			event.pageX = event.clientX + D.getScrollLeft(event.srcElement);
			event.pageY = event.clientY + D.getScrollTop(event.srcElement);
			event.target = event.srcElement;
			event.stopPropagation = stopPropagation;
			event.preventDefault = preventDefault;
			var relatedTarget = {
				"mouseout": event.toElement,
				"mouseover": event.fromElement
			}[event.type];
			if (relatedTarget) {
				event.relatedTarget = relatedTarget;
			}
			return event;
		};

		function stopPropagation() {
			this.cancelBubble = true;
		};

		function preventDefault() {
			this.returnValue = false;
		};
		return {
			"addEvent": addEvent,
			"removeEvent": removeEvent
		};
	})(),
	TplFormat: function(_, B) {
		if (arguments.length > 1) {
			var F = Ylmf.C.TplFormat,
				H = /([.*+?^=!:${}()|[\]\/\\])/g,
				C = (F.left_delimiter || "{").replace(H, "\\$1"),
				A = (F.right_delimiter || "}").replace(H, "\\$1"),
				E = F._r1 || (F._r1 = new RegExp("#" + C + "([^" + C + A + "]+)" + A, "g")),
				G = F._r2 || (F._r2 = new RegExp("#" + C + "(\\d+)" + A, "g"));
			if (typeof(B) == "object") return _.replace(E, function(_, A) {
				var $ = B[A];
				if (typeof $ == "function") $ = $(A);
				return typeof($) == "undefined" ? "" : $;
			});
			else if (typeof(B) != "undefined") {
				var D = Array.prototype.slice.call(arguments, 1),
					$ = D.length;
				return _.replace(G, function(A, _) {
					_ = parseInt(_, 10);
					return (_ >= $) ? A : D[_];
				})
			}
		}
		return _;
	},
	Trim: function(str) {
		str = str.replace(/(^\u3000+)|(\u3000+$)/g, "");
		str = str.replace(/(^ +)|( +$)/g, "");
		return str;
	},
	Cookie: {
		set: function(name, value, expires, path, domain) {
			if (typeof expires == "undefined") {
				expires = new Date(new Date().getTime() + 1000 * 3600 * 24 * 365);
			}
			document.cookie = name + "=" + escape(value) + ((expires) ? "; expires=" + expires.toGMTString() : "") + ((path) ? "; path=" + path : "; path=/") + ((domain) ? ";domain=" + domain : "");
		},
		get: function(name) {
			var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
			if (arr != null) {
				return unescape(arr[2]);
			}
			return null;
		},
		clear: function(name, path, domain) {
			if (this.get(name)) {
				document.cookie = name + "=" + ((path) ? "; path=" + path : "; path=/") + ((domain) ? "; domain=" + domain : "") + ";expires=Fri, 02-Jan-1970 00:00:00 GMT";
			}
		}
	},
	Ajax: function(url, callback) {
		var xhr;
		if (typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
		else {
			var versions = ["Microsoft.XmlHttp", "MSXML2.XmlHttp", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.5.0"];
			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					xhr = new ActiveXObject(versions[i]);
					break;
				} catch (e) {}
			}
		}
		xhr.onreadystatechange = ensureReadiness;

		function ensureReadiness() {
			if (xhr.readyState < 4) {
				return;
			}
			if (xhr.status !== 200) {
				return;
			}
			if (xhr.readyState === 4) {
				callback(xhr);
			}
		}
		xhr.open('GET', url, true);
		xhr.send('');
	},
	GetFocus: function(el) {
		var txt = el.createTextRange();
		txt.moveStart('character', el.value.length);
		txt.collapse(true);
		txt.select();
	},
	DomReady: function(fn) {
		if (!Ylmf.C.Browser.ie) {
			document.addEventListener("DOMContentLoaded", fn, false);
		} else {
			window.setTimeout(fn, 0);
		}
	}
}
if (Ylmf.C.Browser.ie6) {
	try {
		document.execCommand("BackgroundImageCache", false, true);
	} catch (e) {}
};;
Ylmf.D.Baidu = {
	web: {
		action: "https://www.baidu.com/s",
		name: "word",
		btn: "搜索一下",
		img: ["styles/img/search-web.png", "首页"],
		url: "https://www.baidu.com/",
		params: {
			tn: BaiduTn.tn,
			ch: BaiduTn.ch
		}
	},
	music: {
		action: "http://mp3.baidu.com/m",
		name: "word",
		btn: "百度一下",
		img: ["styles/img/search-music.png", "百度MP3"],
		url: "http://mp3.baidu.com/m?ie=utf-8&ct=134217728&word=&tn=" + BaiduTn.tn + "&ch=" + BaiduTn.ch,
		params: {
			tn: BaiduTn.tn,
			ch: BaiduTn.ch,
			f: "ms",
			ct: "134217728"
		}
	},
	video: {
		action: "http://video.baidu.com/v",
		name: "word",
		btn: "百度视频",
		img: ["styles/img/search-video.png", "百度视频"],
		url: "http://video.baidu.com/",
		params: {
			ct: '301989888',
			rn: '20',
			pn: '0',
			db: '0',
			s: '0',
			fbl: '800'
		}
	},
	image: {
		action: "http://image.baidu.com/search/index",
		name: "word",
		btn: "百度一下",
		img: ["styles/img/search-image.png", "百度图片"],
		url: "http://image.baidu.com/",
		params: {
			tn: "baiduimage",
			ch: BaiduTn.ch,
			ct: "201326592",
			cl: "2",
			fm: "2838net",
			lm: "-1",
			ie: "gb2312"
		}
	},
	zhidao: {
		action: "http://zhidao.baidu.com/q",
		name: "word",
		btn: "百度一下",
		img: ["styles/img/search-zhidao.png", "百度知道"],
		url: "http://zhidao.baidu.com/q?pt=ylmf_ik",
		params: {
			tn: "ikaslist",
			pt: "ylmf_ik"
		}
	},
	tieba: {
		action: "https://tieba.baidu.com/f",
		name: "kw",
		btn: "百度一下",
		img: ["styles/img/search-tieba.png", "百度贴吧"],
		url: "http://tieba.baidu.com/",
		params: {
		}
	},
	news: {
		action: "http://news.baidu.com/ns",
		name: "word",
		btn: "百度一下",
		img: ["styles/img/search-news.png", "百度新闻"],
		url: "http://news.baidu.com/",
		params: {
			tn: "baiduWikiSearch",
			submit: "search",
			pn: "0",
			rn: "10",
			ct: "17",
			lm: "0"
		}
	},
	ditu: {
		action: "http://map.baidu.com/m",
		name: "word",
		btn: "搜索地图",
		img: ["styles/img/search-map.png", "百度地图"],
		url: "http://map.baidu.com/",
		params: {
			ie: 'gbk'
		}
	}
};
Ylmf.D.Mail = {
	submit: {
		m_163: {
			action: "http://reg.163.com/CheckUser.jsp",
			params: {
				url: "http://entry.mail.163.com/coremail/fcg/ntesdoor2?lightweight=1&verifycookie=1&language=-1&style=15",
				username: "#{u}",
				password: "#{p}"
			}
		},
		m_126: {
			action: "https://reg.163.com/logins.jsp",
			params: {
				domain: "126.com",
				username: "#{u}@126.com",
				password: "#{p}",
				url: "http://entry.mail.126.com/cgi/ntesdoor?lightweight%3D1%26verifycookie%3D1%26language%3D0%26style%3D-1"
			}
		},
		m_v163: {
			action: "https://ssl1.vip.163.com/logon.m",
			params: {
				username: "#{u}",
				password: "#{p}",
				enterVip: "true"
			}
		},
		m_sina: {
			action: "http://mail.sina.com.cn/cgi-bin/login.cgi",
			params: {
				u: "#{u}",
				psw: "#{p}"
			}
		},
		m_vsina: {
			action: "http://vip.sina.com.cn/cgi-bin/login.cgi",
			params: {
				user: "#{u}",
				pass: "#{p}"
			}
		},
		m_yahoo: {
			action: "https://edit.bjs.yahoo.com/config/login",
			params: {
				login: "#{u}@yahoo.com.cn",
				passwd: "#{p}",
				domainss: "yahoo",
				".intl": "cn",
				".src": "ym"
			}
		},
		m_yahoo_cn: {
			action: "https://edit.bjs.yahoo.com/config/login",
			params: {
				login: "#{u}@yahoo.cn",
				passwd: "#{p}",
				domainss: "yahoocn",
				".intl": "cn",
				".done": "http://mail.cn.yahoo.com/inset.html"
			}
		},
		m_sohu: {
			action: "http://passport.sohu.com/login.jsp",
			params: {
				loginid: "#{u}@sohu.com",
				passwd: "#{p}",
				fl: "1",
				vr: "1|1",
				appid: "1000",
				ru: "http://login.mail.sohu.com/servlet/LoginServlet",
				ct: "1173080990",
				sg: "5082635c77272088ae7241ccdf7cf062"
			}
		},
		m_tom: {
			action: "http://login.mail.tom.com/cgi/login",
			params: {
				user: "#{u}",
				pass: "#{p}"
			}
		},
		m_21cn: {
			action: "http://passport.21cn.com/maillogin.jsp",
			params: {
				UserName: "#{u}@21cn.com",
				passwd: "#{p}",
				domainname: "21cn.com"
			}
		},
		m_yeah: {
			action: "https://reg.163.com/logins.jsp",
			params: {
				domain: "yeah.net",
				username: "#{u}@yeah.net",
				password: "#{p}",
				url: "http://entry.mail.yeah.net/cgi/ntesdoor?lightweight%3D1%26verifycookie%3D1%26style%3D-1"
			}
		},
		m_189: {
			action: "http://zx.passport.189.cn/Logon/UDBCommon/S/PassportLogin.aspx?PassportLoginRequest=3500000000400101%243qGTaeZcFhxvAWjKmUNeSXwAgn1LsgB7Baj1rQn96XNKuzpE%2baP%2b9Q6CDg1Bqmrnosfrnoa6ujbo%0aBzYxmWBAESIoGVwlaoSM4%2fMixUkU7%2fAcJ0L4Yrckifcqhk3rO22i",
			params: {
				__VIEWSTATE: "/wEPDwUKMTYxODg2ODExNQ9kFgJmD2QWDgIBDxYCHgVzdHlsZQUSdmlzaWJpbGl0eTp2aXNpYmxlFgICAQ8PFgIeBFRleHQFG+eUqOaIt+WQjeaIluWvhueggemUmeivr+OAgmRkAg0PDxYEHgtOYXZpZ2F0ZVVybAVIaHR0cDovL3Bhc3Nwb3J0LjE4OS5jbi9TZWxmUy9ML1JlZy9TZWxlY3QuYXNweD9EZXZpY2VObz0zNTAwMDAwMDAwNDAwMTAxHwEFByDms6jlhoxkZAIPDw8WAh8BBTRodHRwOi8vd3d3LjE4OS5jbi93ZWJtYWlsL2pzcC8xODltaXNjL3Y1L2Nzcy91ZGIuY3NzZGQCEQ8PFgIfAQUtaHR0cDovL3dlYm1haWw1LjE4OS5jbi93ZWJtYWlsL1VEQkxvZ2luUmV0dXJuZGQCEw8PFgIfAQUQMzUwMDAwMDAwMDQwMDEwMWRkAhUPDxYCHwEFDDEyNC4yMDUuNzcuOWRkAhcPDxYCHwEFDHZCWWdGcWRydTVrPWRkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYBBQtjYl9TYXZlTmFtZYevyftAQT5CX9s2VZJOrPsTLqDH",
				__EVENTVALIDATION: "/wEWCQLckeONBALT8dy8BQKd+7qdDgK/8ZbBBQKhwImNCwK1yJy1AQLhyKz0DgKh/9zICgKnqZGuBiPwFoYTVzM5HAbhLCKRJWRuEyet",
				txtUserID: "#{u}",
				txtPwd: "#{p}"
			}
		},
		m_139: {
			action: "https://mail.10086.cn/Login/Login.ashx",
			params: {
				UserName: "#{u}",
				Password: "#{p}",
				ClientId: "5028",
				type: "mail"
			}
		},
		m_baidu: {
			action: "http://passport.baidu.com/?login",
			params: {
				u: "http://passport.baidu.com/center",
				username: "#{u}",
				password: "#{p}"
			}
		},
		m_renren: {
			action: "http://passport.renren.com/PLogin.do",
			params: {
				email: "#{u}",
				password: "#{p}",
				origURL: "http://www.renren.com/Home.do",
				domain: "renren.com"
			}
		},
		m_51: {
			action: "http://passport.51.com/login.5p",
			params: {
				passport_51_user: "#{u}",
				passport_51_password: "#{p}",
				gourl: "http%3A%2F%2Fmy.51.com%2Fwebim%2Findex.php"
			}
		},
		m_chinaren: {
			action: "http://passport.sohu.com/login.jsp",
			params: {
				loginid: "#{u}@chinaren.com",
				passwd: "#{p}",
				fl: "1",
				vr: "1|1",
				appid: "1005",
				ru: "http://profile.chinaren.com/urs/setcookie.jsp?burl=http://alumni.chinaren.com/",
				ct: "1174378209",
				sg: "84ff7b2e1d8f3dc46c6d17bb83fe72bd"
			}
		}
	},


	link: {
		l_alipay: {
			action: "https://www.alipay.com/user/login.htm"
		},
		l_baidu: {
			action: "https://passport.baidu.com/v2/?logi"
		},
		l_qmail: {
			action: "http://mail.qq.com"
		},
		l_qzone: {
			action: "http://qzone.qq.com/index.html"
		},
		l_weibo: {
			action: "http://weibo.com/login.php"
		},
		l_gmail: {
			action: "https://www.google.com/intl/zh-CN/gmail/about/e"
		},
		l_hotmail: {
			action: "http://www.hotmail.com/"
		},
		l_aly: {
			action: "https://passport.alipay.com/login/login.htm?return_url=http%3A%2F%2Fmail.aliyun.com%2Falimail%2Fauth%2FcallbackForHavana%3Freurl%3D%252Falimail%252F&amp;fromSite=9"
		},
		l_189: {
			action: "http://mail.189.cn/"
		},
		l_kaixin: {
			action: "http://www.kaixin001.com/"
		}
	}
};
Ylmf.M.Calendar = (function() {
	var lunarInfo = [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63];
	var Gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸");
	var Zhi = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥");
	var now = new Date();
	var SY = now.getFullYear();
	var SM = now.getMonth();
	var SD = now.getDate();

	function cyclical(num) {
		return (Gan[num % 10] + Zhi[num % 12])
	}

	function lYearDays(y) {
		var i, sum = 348;
		for (i = 0x8000; i > 0x8; i >>= 1)
		sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
		return (sum + leapDays(y))
	}

	function leapDays(y) {
		if (leapMonth(y)) return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
		else return (0)
	}

	function leapMonth(y) {
		return (lunarInfo[y - 1900] & 0xf)
	}

	function monthDays(y, m) {
		return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29
	}

	function Lunar(objDate) {
		var i, leap = 0,
			temp = 0;
		var baseDate = new Date(1900, 0, 31);
		var offset = (objDate - baseDate) / 86400000;
		this.dayCyl = offset + 40;
		this.monCyl = 14;
		for (i = 1900; i < 2050 && offset > 0; i++) {
			temp = lYearDays(i);
			offset -= temp;
			this.monCyl += 12
		}
		if (offset < 0) {
			offset += temp;
			i--;
			this.monCyl -= 12
		}
		this.year = i;
		this.yearCyl = i - 1864;
		leap = leapMonth(i);
		this.isLeap = false;
		for (i = 1; i < 13 && offset > 0; i++) {
			if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
				--i;
				this.isLeap = true;
				temp = leapDays(this.year)
			} else {
				temp = monthDays(this.year, i)
			}
			if (this.isLeap == true && i == (leap + 1)) {
				this.isLeap = false
			}
			offset -= temp;
			if (this.isLeap == false) {
				this.monCyl++
			}
		}
		if (offset == 0 && leap > 0 && i == leap + 1) {
			if (this.isLeap) {
				this.isLeap = false
			} else {
				this.isLeap = true;
				--i;
				--this.monCyl
			}
		}
		if (offset < 0) {
			offset += temp;
			--i;
			--this.monCyl
		}
		this.month = i;
		this.day = offset + 1
	}

	function cDay(m, d) {
		var nStr1 = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
		var nStr2 = ['初', '十', '廿', '卅'];
		var s;
		if (m > 10) {
			s = '十' + nStr1[m - 10]
		} else {
			s = nStr1[m]
		}
		if (s == '一') {
			s = '正';
		}
		s += '月';
		switch (d) {
		case 10:
			s += '初十';
			break;
		case 20:
			s += '二十';
			break;
		case 30:
			s += '三十';
			break;
		default:
			s += nStr2[Math.floor(d / 10)];
			s += nStr1[parseInt(d % 10)]
		}
		return (s)
	}

	function solarDay2() {
		var lDObj = new Lunar(new Date(SY, SM, SD));
		var tt = cDay(lDObj.month, lDObj.day);
		return (tt)
	}

	function showToday(tpl) {
		var weekStr = "日一二三四五六";
		var template = tpl;
		var day = Ylmf.C.TplFormat(template, {
			YY: SY,
			MM: SM + 1,
			DD: SD,
			week: weekStr.charAt(now.getDay())
		});
		return day;
	}

	function showdate() {
		SD = SD + 1;
		var m = SM < 9 ? ('0' + (SM + 1)) : SM + 1;
		var d = SD + 1 < 10 ? ('0' + SD) : SD;
		return (SY + '-' + m + '-' + d);
	}

	function cncal(tpl) {
		var template = tpl;
		var cacal = Ylmf.C.TplFormat(template, {
			cnday: solarDay2()
		});
		return cacal;
	}
	return {
		day: showToday,
		cnday: cncal,
		date: showdate
	}
})();;
Ylmf.M.MailLogin = (function() {
	var mailCache = [];
	var on = false;
	var sendMail = function(opt) {
			if (!opt) opt = {};
			var username = opt.u,
				password = opt.p,
				servers = opt.s,
				form = opt.f,
				data = opt.d,
				F = {
					u: username.value,
					p: password.value
				};
			form.onsubmit = function() {
				if (servers.value == '') {
					alert("您没有选择邮箱！");
					return false;
				} else {
					setData();
				}
				if (Ylmf.C.Trim(username.value) == "" || Ylmf.C.Trim(username.value) == "邮箱登录") {
					alert("用户名不能为空！");
					username.focus();
					return false;
				}
				if (Ylmf.C.Trim(password.value) == "") {
					alert("密码不能为空！");
					password.focus();
					return false;
				}
			}
			var setData = function() {
					F = {
						u: username.value,
						p: password.value
					};
					if (servers.value != '') {
						var dataArr = servers.value.split('|');
						var type = (dataArr[0] == 's') ? 'submit' : 'link';
						var d = data[type][dataArr[1]];
						if (type == 'link') {
							window.open(d.action);
						} else if (type == 'submit') {
							form.action = d.action;
							if (mailCache.length > 0) {
								for (var i = 0; i < mailCache.length; i++) {
									form.removeChild(mailCache[i]);
								}
								mailCache = [];
							}
							var _hPara;
							for (I in d.params) {
								_hPara = document.createElement('input');
								_hPara.type = 'hidden';
								_hPara.name = I;
								_hPara.value = Ylmf.C.TplFormat(d.params[I], F);
								form.appendChild(_hPara);
								mailCache.push(_hPara);
							}
						} else {
							alert('邮箱服务器有错');
						}
					}
				};
			if (servers.value != '') {
				setData();
			}
			servers.onchange = function() {
				setData();
			}
			var ul = form.getElementsByTagName('ul')[0];
			var showMore = function() {
					if (!on) {
						ul.className = '';
					}
					if (username.value == '') {
						username.value = '邮箱登录';
						this.style.color = '#ccc';
					}
				}
			username.onfocus = function() {
				on = true;
				if (Ylmf.C.Trim(this.value) == '邮箱登录') {
					this.value = '';
					this.style.color = '#333';
				}
				ul.className = 'hover';
				ul.onmouseover = function() {
					on = true;
				}
				ul.onmouseout = function() {
					on = false;
				}
			}
			username.onblur = showMore;
			Ylmf.C.Event.addEvent(document, 'click', function(e) {
				if (!on) {
					ul.className = '';
				}
			});
		};
	return {
		sendMail: sendMail
	}
})();;
Ylmf.M.SearchForm = function(opt) {
	if (!opt) opt = {};
	var tArr = opt.tab,
		form = opt.form.f,
		key = opt.form.k,
		label = opt.form.l,
		btn = opt.form.b,
		pix = opt.keyprefix,
		data = opt.data,
		active = opt.active || 'active',
		parCache = [];
	Ylmf.M.Suggest.tArr = tArr;
	Ylmf.M.Suggest.active = active;
	var hInput = form.getElementsByTagName('input'),
		len = hInput.length;
	for (var i = 0; i < len; i++) {
		if (hInput[i].type == 'hidden') parCache.push(hInput[i]);
	}
	var setForm = function(d) {
			form.action = d.action;
			// label.href = d.url;
			// $('#JsearchLogo').src = d.img[0];
			// $('#JsearchLogo').atr = d.img[1];

			$('#JsearchLogo').attr('src',d.img[0]);
			$('#JsearchLogo').attr('alt',d.img[1]);


			// label.getElementsByTagName('img')[0].src = d.img[0];
			// label.getElementsByTagName('img')[0].art = d.img[1];


			key.name = d.name;
			btn.value = d.btn;
			if (parCache.length > 0) {
				for (var i = 0; i < parCache.length; i++) {
					var o = parCache[i];
					o.parentNode.removeChild(o);
				}
				parCache = [];
			}
			var _hPara;
			for (I in d.params) {
				_hPara = document.createElement('input');
				_hPara.type = 'hidden';
				_hPara.name = I;
				_hPara.value = d.params[I];
				form.appendChild(_hPara);
				parCache.push(_hPara);
			}
			key.focus();
		}
	key.onfocus = function() {
		if (Ylmf.C.Browser.ie) {
			Ylmf.C.GetFocus(this);
		}
	}
	var setCurr = function(elem) {
			for (var i = 0; i < tArr.length; i++) {
				tArr[i].className = '';
			}
			elem.className = active;
		}
	// var cArr = Ylmf.C.$ID(pix).getElementsByTagName('div');
	// var keyShow = function(elem) {
	// 		var elem = Ylmf.C.$ID(pix + '_' + elem);
	// 		for (var i = 0; i < cArr.length; i++) {
	// 			cArr[i].style.display = 'none';
	// 		}
	// 		elem.style.display = '';
	// 	}

	for (var i = 0; i < tArr.length; i++) {
		var tab = tArr[i];
		tab.onclick = function() {
			var rel = this.getAttribute('rel');
			setForm(data[rel]);
			setCurr(this);
			// keyShow(rel);
			Ylmf.M.Suggest.type = rel;
		}
	}
	btn.onclick = function() {
		if (Ylmf.C.Trim(key.value) == '') {
			window.open(label.getAttribute('href'));
			return false;
		}
	}
};
Ylmf.M.Suggest = {
	type: 'web',
	tempScript: null,
	su: null,
	key: null,
	form: null,
	KeywordItems: null,
	currentKey: -1,
	mouseSelect: false,
	stopRequest: false,
	Hidestate: false,
	isClose: false,
	tArr: [],
	active: null,
	curTab: function() {
		var curRel, c = Ylmf.M.Suggest;
		for (var i = 0, len = c.tArr.length; i < len; i++) {
			if (c.tArr[i].className == c.active) {
				curRel = c.tArr[i].getAttribute('rel');
				break;
			};
		}
		return curRel;
	},
	init: function(opt) {
		var K = opt.k,
			S = opt.s,
			Query;
		Ylmf.M.Suggest.form = opt.f;
		Ylmf.M.Suggest.su = opt.s;
		K.onkeydown = function(e) {
			Ylmf.M.Suggest.su = opt.s;
			Ylmf.M.Suggest.key = opt.k;
			var e = e || window.event;
			if (Ylmf.M.Suggest.isClose) return;
			switch (e.keyCode) {
			case 38:
				if (Ylmf.M.Suggest.Hidestate) {
					if (this.value == "") return;
					S.style.display = 'none';
					Ylmf.M.Suggest.Hidestate = false;
				} else {
					Ylmf.M.Suggest.currentKey--;
				}
				Ylmf.M.Suggest.selectItem();
				break;
			case 40:
				if (Ylmf.M.Suggest.Hidestate) {
					if (this.value == "") return;
					S.style.display = 'block';
					Ylmf.M.Suggest.Hidestate = false;
				} else {
					Ylmf.M.Suggest.currentKey++;
				}
				Ylmf.M.Suggest.selectItem();
				break;
			case 27:
				this.value = Query;
				Ylmf.M.Suggest.hideSuggest();
				break;
			case 13:
				Ylmf.M.Suggest.hideSuggest();
				break;
			default:
				break;
			}
		}
		K.onkeyup = function(e) {
			var e = e || window.event;
			if (Ylmf.M.Suggest.isClose) {
				return;
			}
			Query = this.value;
			switch (e.keyCode) {
			case 38:
				Ylmf.M.Suggest.stopRequest = true;
				break;
			case 40:
				Ylmf.M.Suggest.stopRequest = true;
				break;
			case 8:
				if (this.value == "") {
					Ylmf.M.Suggest.hideSuggest();
				} else {
					Ylmf.M.Suggest.type = Ylmf.M.Suggest.curTab();
					Ylmf.M.Suggest.requestData(this.value);
				}
				break;
			case 27:
				this.value = Query;
				Ylmf.M.Suggest.hideSuggest();
			case 13:
				Ylmf.M.Suggest.hideSuggest();
				break;
			default:
				if (Query != "") {
					Ylmf.M.Suggest.type = Ylmf.M.Suggest.curTab();
					Ylmf.M.Suggest.requestData(this.value);
				}
				break;
			}
		}
		K.onblur = function() {
			if (!Ylmf.M.Suggest.mouseSelect) {
				Ylmf.M.Suggest.hideSuggest();
			}
		}
	},
	selectItem: function() {
		if (!Ylmf.M.Suggest.KeywordItems) return;
		var len = Ylmf.M.Suggest.KeywordItems.length;
		Ylmf.M.Suggest.stopRequest = true;
		if (Ylmf.M.Suggest.currentKey < 0) {
			Ylmf.M.Suggest.currentKey = len - 1;
		} else if (Ylmf.M.Suggest.currentKey >= len) {
			Ylmf.M.Suggest.currentKey = 0;
		}
		for (var i = 0, len = Ylmf.M.Suggest.KeywordItems.length; i < len; i++) {
			Ylmf.M.Suggest.KeywordItems[i].className = "";
		}
		Ylmf.M.Suggest.KeywordItems[Ylmf.M.Suggest.currentKey].className = "hover";
		Ylmf.M.Suggest.key.value = Ylmf.M.Suggest.KeywordItems[Ylmf.M.Suggest.currentKey].innerHTML;
	},
	showSuggest: function(data) {
		if (typeof(data) != "object" || typeof(data) == "undefined") return;
		var html = '<ul>';
		var tab = Ylmf.M.Suggest.type;
		for (var i = 0; i < data.length; i++) {
			var k = tab == 'taobao' ? data[i][0] : data[i];
			html += '<li key="' + i + '">' + k + '</li>';
		}
		html += '</ul>';
		Ylmf.M.Suggest.su.innerHTML = html;
		Ylmf.M.Suggest.KeywordItems = Ylmf.M.Suggest.su.getElementsByTagName("li");
		Ylmf.M.Suggest.su.style.display = 'block';
		Ylmf.M.Suggest.currentKey = -1;
		Ylmf.M.Suggest.Hidestate = false;
		Ylmf.M.Suggest.mouseHandle();
	},
	hideSuggest: function() {
		Ylmf.M.Suggest.su.style.display = 'none';
		Ylmf.M.Suggest.Hidestate = true;
	},
	closeSuggest: function closeSuggest() {
		Ylmf.M.Suggest.key.setAttribute("autocomplete", "on");
		Ylmf.M.Suggest.su.style.display = 'none';
		Ylmf.M.Suggest.isClose = true;
	},
	mouseHandle: function() {
		Ylmf.M.Suggest.su.onmouseover = function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement;
			if (target.tagName.toUpperCase() == "LI") {
				for (var i = 0, len = Ylmf.M.Suggest.KeywordItems.length; i < len; i++) {
					Ylmf.M.Suggest.KeywordItems[i].className = "";
				}
				target.className = "hover";
				Ylmf.M.Suggest.currentKey = parseInt(target.getAttribute("key"));
			}
			Ylmf.M.Suggest.mouseSelect = true;
		}
		Ylmf.M.Suggest.su.onmouseout = function() {
			Ylmf.M.Suggest.mouseSelect = false;
		}
		Ylmf.M.Suggest.su.onclick = function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement;
			if (target.tagName.toUpperCase() == "LI") {
				Ylmf.M.Suggest.key.value = target.innerHTML;
				Ylmf.M.Suggest.hideSuggest();
				Ylmf.M.Suggest.submitEvent();
				Ylmf.M.Suggest.form.submit();
			}
			if (target.className == "closeSugBtn") {
				Ylmf.M.Suggest.closeSuggest();
			}
		}
	},
	submitEvent: function() {},
	requestData: function(key) {
		var head = document.getElementsByTagName("head")[0];
		var TAB = Ylmf.M.Suggest.type;
		if (Ylmf.M.Suggest.tempScript) {
			if (TAB == "taobao") {
				Ylmf.M.Suggest.tempScript.charset = "utf-8";
			} else {
				Ylmf.M.Suggest.tempScript.charset = "gb2312";
			}
		}
		if (!Ylmf.C.Browser.ie) {
			if (Ylmf.M.Suggest.tempScript) {
				head.removeChild(Ylmf.M.Suggest.tempScript);
			}
			Ylmf.M.Suggest.tempScript = null;
		}
		if (!Ylmf.M.Suggest.tempScript) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.charset = (TAB == "taobao") ? "utf-8" : "gb2312";
			head.appendChild(script);
			Ylmf.M.Suggest.tempScript = script;
		}
		var rd = new Date().getTime();
		var key = encodeURIComponent(key);
		var Url = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=" + key + "&sc=hao123&rd=" + rd;
		switch (TAB) {
		case "music":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=mp3&sc=hao123&rd=" + rd;
			break;
		case "image":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=image&fm=hao123&rd=" + rd;
			break;
		case "video":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=video&fm=hao123&rd=" + rd;
			break;
		case "tieba":
			Url = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=" + key + "&sc=hao123&rd=" + rd;
			break;
		case "zhidao":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=zhidao&sc=hao123&rd=" + rd;
			break;
		case "web":
			Url = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=" + key + "&sc=hao123&rd=" + rd;
			break;
		case "news":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=news&sc=hao123&rd=" + rd;
			break;
		case "map":
			Url = "http://nssug.baidu.com/su?wd=" + key + "&prod=map&sc=hao123&rd=" + rd;
			break;
		default:
			Url = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=" + key + "&sc=hao123&rd=" + rd;
		}
		Ylmf.M.Suggest.tempScript.src = Url;
	}
};
window.baidu = {};
window.baidu.sug = function(O) {
	if (typeof(O) == "object" && typeof(O.s) != "undefined" && typeof(O.s[0]) != "undefined") {
		Ylmf.M.Suggest.showSuggest(O.s);
	} else {
		Ylmf.M.Suggest.hideSuggest();
	}
};
window.TB = {};
window.TB.Suggest = {};
window.TB.Suggest.callback = function(O) {
	if (typeof(O) == "object" && typeof(O.result) != "undefined" && typeof(O.result[0][0]) != "undefined") {
		Ylmf.M.Suggest.showSuggest(O.result);
	} else {
		Ylmf.M.Suggest.hideSuggest();
	}
};
// Ylmf.M.Taber = function(opt) {
// 	if (!opt) opt = {};
// 	var tArr = opt.tab,
// 		active = opt.active || 'active',
// 		delay = opt.delay || 300,
// 		cArr = [],
// 		timer;
// 	for (var i = 0; i < tArr.length; i++) {
// 		var rel = tArr[i].getAttribute('rel');
// 		cArr.push(Ylmf.C.$ID(rel));
// 	}
// 	var conShow = function(elem) {
// 			var elem = Ylmf.C.$ID(elem);
// 			for (var i = 0; i < cArr.length; i++) {
// 				cArr[i].style.display = 'none';
// 			}
// 			elem.style.display = 'block';
// 		}
// 	var setCurr = function(elem) {
// 			for (var i = 0; i < tArr.length; i++) {
// 				tArr[i].className = '';
// 			}
// 			elem.className = active;
// 		}
// 	for (var i = 0; i < tArr.length; i++) {
// 		var tab = tArr[i];
// 		tab.onclick = function() {
// 			if (timer) window.clearTimeout(timer);
// 			conShow(this.getAttribute('rel'));
// 			setCurr(this);
// 		}
// 		tab.onmouseover = function() {
// 			var that = this;
// 			if (timer) window.clearTimeout(timer);
// 			timer = window.setTimeout(function() {
// 				conShow(that.getAttribute('rel'));
// 				setCurr(that);
// 			}, delay);
// 		}
// 		tab.onmouseout = function() {
// 			if (timer) window.clearTimeout(timer);
// 		}
// 	}
// };
// Ylmf.M.SetHome = function(obj, hostname) {
// 	if (!Ylmf.C.Browser.ie) {
// 		$('.set-home-pop').addClass('tips-active').show();
// 		return;
// 	}
// 	var host = hostname;
// 	if (!host) {
// 		host = window.location.href;
// 	}
// 	obj.style.behavior = 'url(#default#homepage)';

// 	obj.setHomePage(host);
// };
Ylmf.M.DateFormat = function(format, day) {
	var day = day || 0;
	var that = new Date(new Date().getTime() + (3600 * 24 * 1000) * day);
	var o = {
		"M+": that.getMonth() + 1,
		"d+": that.getDate(),
		"h+": that.getHours(),
		"m+": that.getMinutes(),
		"s+": that.getSeconds(),
		"q+": Math.floor((that.getMonth() + 3) / 3),
		"S": that.getMilliseconds()
	}
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (that.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
Ylmf.M.SubDrop = function(opt) {
	if (!opt) opt = {};
	var oArr = opt.arr,
		timer = opt.timer || 200,
		activeContent, hideState = true,
		delayInterval;
	var hide = function() {
			if (hideState && activeContent) {
				activeContent.style.display = 'none';
			}
		}
	for (var i = 0; i < oArr.length; i++) {
		var el = oArr[i];
		el.onmouseover = function() {
			hide();
			var box = this.parentNode.getElementsByTagName('div')[0];
			delayInterval = window.setTimeout(function() {
				box.style.display = 'block';
			}, timer);
			activeContent = box;
			hideState = false;
			if (!box.onmouseover) {
				box.onmouseover = function() {
					hideState = false;
				}
				box.onmouseout = function() {
					hideState = true;
					window.setTimeout(hide, timer);
				}
			}
		}
		el.onmouseout = function() {
			hideState = true;
			window.setTimeout(hide, timer);
			if (delayInterval != undefined) {
				window.clearTimeout(delayInterval);
			}
		}
	}
};
Ylmf.M.Hover = function(opt) {
	if (!opt) opt = {};
	var arr = opt.arr,
		hover = opt.cls || 'hover';
	for (var i = 0; i < arr.length; i++) {
		arr[i].onmouseover = function() {
			this.className += ' ' + hover;
		}
		arr[i].onmouseout = function() {
			this.className = this.className.replace(new RegExp(' ' + hover + '\\b'), '');
		}
	}
};
var kuxun = (function() {
	return {
		searchTravel: function() {
			var _q = document.getElementById("daodao_travel_q").value;
			var _k = document.getElementById("daodao_travel_k").value;
			var _kw = "http://dujia.kuxun.cn/index.php?action=xianlu&method=bdsearchpost";
			if (_q && !_k) {
				_kw += "&StartPlace=" + encodeURIComponent(_q)
			} else if (!_q && _k) {
				_kw += "&KeyWords=" + encodeURIComponent(_k)
			} else if (_q && _k) {
				_kw += "&StartPlace=" + encodeURIComponent(_q) + "&KeyWords=" + encodeURIComponent(_k)
			}
			_kw += '&SourceID=kuxunbd&FromID=K123456789';
			window.open(_kw);
		},
		searchHotel: function() {
			var _q = document.getElementById("ht_city").value;
			var _k = document.getElementById("ht_key").value;
			var _d = document.getElementById("ht_today").value;
			var _kw = "http://hotel.kuxun.cn/search.php";
			if (_q && !_k) {
				_kw += "?city=" + encodeURIComponent(_q)
			} else if (!_q && _k) {
				_kw += "?hotel=" + encodeURIComponent(_k)
			} else if (_q && _k) {
				_kw += "?city=" + encodeURIComponent(_q) + "&hotel=" + encodeURIComponent(_k)
			}
			_kw += '&date=' + _d + '&fromid=K123456789';
			window.open(_kw);
		}
	}
})();
Ylmf.C.DomReady(function() {
	var setArr = ['setHome1', 'setHome2'];
	for (var i = 0; i < setArr.length; i++) {
		var obj = Ylmf.C.$ID(setArr[i]);
		if (obj) {
			obj.onclick = function() {
				Ylmf.M.SetHome(this, window.location.href);
				return false;
			}
		}
	}
	var dayTpl = '#{MM}月#{DD}日 周#{week}</h3>';
	var cnTpl = '#{cnday}';
	Ylmf.C.$ID('curDate').innerHTML = Ylmf.M.Calendar.day(dayTpl);
	Ylmf.C.$ID('curLunar').innerHTML = Ylmf.M.Calendar.cnday(cnTpl);
	Ylmf.M.MailLogin.sendMail({
		f: Ylmf.C.$ID('mail'),
		u: Ylmf.C.$ID('JmailUser'),
		p: Ylmf.C.$ID('JmailPwd'),
		s: Ylmf.C.$ID('JmailServer'),
		d: Ylmf.D.Mail
	});
	Ylmf.M.SearchForm({
		tab: Ylmf.C.$ID('JsearchTab').getElementsByTagName('li'),
		form: {
			f: Ylmf.C.$ID('JsearchForm'),
			k: Ylmf.C.$ID('JsearchKey'),
			b: Ylmf.C.$ID('JsearchBtn'),
			l: Ylmf.C.$ID('JsearchLogo')
		},
		data: Ylmf.D.Baidu,
		keyprefix: 'sw',
		active: 'current'
	});
	Ylmf.M.Suggest.init({
		f: Ylmf.C.$ID('JsearchForm'),
		k: Ylmf.C.$ID('JsearchKey'),
		s: Ylmf.C.$ID('suggest')
	});
	// Ylmf.M.Taber({
	// 	tab: Ylmf.C.$ID('JtoolTab').getElementsByTagName('li'),
	// 	active: 'current'
	// });
	// Ylmf.M.SubDrop({
	// 	arr: Ylmf.C.$ID('topsite').getElementsByTagName('em')
	// });
	var changJoke = function() {
			var d = jokesDate,
				c = Ylmf.C,
				j = d[+new Date % d.length];
			c.$ID('JjokeTxt').href = j.src + '?id=' + j.id;
			c.$ID('JjokeTxt').innerHTML = j.title;
		}
	changJoke();
	Ylmf.C.$ID('JjokeBtn').onclick = changJoke;
	var _mon = false;
	// Ylmf.C.$ID('JmoreSear').onclick = function() {
	// 	var obj = Ylmf.C.$ID('JmoreSearList'),
	// 		tar = Ylmf.C.$ID('JmoreSear'),
	// 		s = obj.style.display;
	// 	obj.style.display = (s != 'none') ? 'none' : 'block';
	// 	_mon = true;
	// 	tar.onmouseover = function() {
	// 		_mon = true;
	// 	}
	// 	tar.onmouseout = function() {
	// 		_mon = false;
	// 	}
	// }
	// Ylmf.C.Event.addEvent(document, 'click', function() {
	// 	if (!_mon) {
	// 		Ylmf.C.$ID('JmoreSearList').style.display = 'none';
	// 	}
	// });



	// var formatArr = ['jp_today', 'ht_today'];
	// for (var i = 0; i < formatArr.length; i++) {
	// 	var o = Ylmf.C.$ID(formatArr[i]);
	// 	o.value = Ylmf.M.DateFormat('yyyy-MM-dd', 1);
	// }




	// if (Ylmf.C.Browser.ie6) {
	// 	Ylmf.M.Hover({
	// 		arr: Ylmf.C.$ID('JspecTool').getElementsByTagName('li'),
	// 		cls: 'hover'
	// 	});
	// }
});
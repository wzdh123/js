



//选项卡
jQuery.fn.switchTab = function(l) {
	l = jQuery.extend({
		defaultIndex: 0,
		titOnClassName: "current",
		titCell: ".tabs span",
		mainCell: ".tab-panel",
		delayTime: 250,
		interTime: 0,
		trigger: "click",
		effect: "",
		omitLinks: false,
		debug: ""
	}, l, {
		version: 120
	});
	this.each(function() {
		var b;
		var c = -1;
		var d = jQuery(this);
		if (l.omitLinks) {
			l.titCell = l.titCell + "[href^='#']"
		}
		var e = d.find(l.titCell);
		var f = d.find(l.mainCell);
		var g = e.length;
		var h = function(a) {
				if (a != c) {
					e.eq(c).removeClass(l.titOnClassName);
					f.hide();
					d.find(l.titCell + ":eq(" + a + ")").addClass(l.titOnClassName);
					if (l.delayTime < 50 && l.effect != "") l.effect = "";
					if (l.effect == "fade") {
						d.find(l.mainCell + ":eq(" + a + ")").fadeIn({
							queue: false,
							duration: 100
						})
					} else if (l.effect == "slide") {
						d.find(l.mainCell + ":eq(" + a + ")").slideDown({
							queue: false,
							duration: 100
						})
					} else {
						d.find(l.mainCell + ":eq(" + a + ")").show()
					}
					c = a
				}
			};
		var j = function() {
				e.eq(c).removeClass(l.titOnClassName);
				f.hide();
				if (++c >= g) c = 0;
				e.eq(c).addClass(l.titOnClassName);
				f.eq(c).show()
			};
		h(l.defaultIndex);
		if (l.interTime > 0) {
			var k = setInterval(function() {
				j()
			}, l.interTime)
		}
		e.each(function(i, a) {
			if (l.trigger == "click") {
				jQuery(a).click(function() {
					h(i);
					return false
				})
			} else if (l.delayTime > 0) {
				jQuery(a).hover(function() {
					b = setTimeout(function() {
						h(i);
						b = null
					}, l.delayTime)
				}, function() {
					if (b != null) clearTimeout(b)
				})
			} else {
				jQuery(a).mouseover(function() {
					h(i)
				})
			}
		})
	});
	if (l.debug != "") alert(l[l.debug]);
	return this
};


$(function(){

  // 左侧选项卡
  $(".side-news").switchTab({titCell: ".news-tabs li",mainCell: ".news-tab-cont", trigger: "mouseover", delayTime:100,defaultIndex:0,effect:'fade'});

  // 左侧栏选项卡
  $(".side-ad-box").switchTab({titCell: ".side-tabs li",mainCell: ".side-tab-cont", trigger: "mouseover", delayTime:100,defaultIndex:0,effect:'fade'});

  // 购物选项卡
  $(".floor-shop").switchTab({titCell: ".shop-tabs li",mainCell: ".shop-tab-cont", trigger: "mouseover", delayTime:100,defaultIndex:0,effect:'fade'});

  // 名站打开关闭
  $('.famous-toggle').on('click',function(){
  	var famous=$(this).parents('.famous-layer');
  	if(!famous.hasClass('f-active')){
  		famous.addClass('f-active');
  		famous.find('.famous-txt-list ul,.news-txt-list').slideDown(200);
  	}
  	else{
  		famous.removeClass('f-active');
  		famous.find('.famous-txt-list ul,.news-txt-list').slideUp(200);
  	}
  })

  // 关闭"设首页提示层"
  $('.set-home-pop .close-pop').on('click',function(){
  	$(this).parents('.set-home-pop').hide().removeClass('brower-other-active');
  })


  // 搜索框固定顶部
  var sOffset=$('.search-tabs').offset();
  var sTop=sOffset.top+20;
  $(document).on('scroll',function(){
  	if($(document).scrollTop()>sTop){
  		$('body').addClass('search-fixed');
  	}
  	else{
  		$('body').removeClass('search-fixed');
  	}
  })

  // 音乐
  $('.music-box iframe').attr('src',$('.music-box iframe').data('src'));
  $('.music-box').hover(function(){
  	$(this).toggleClass('music-box-hover');
  })


});



// 加入收藏
function AddFavorite(sURL, sTitle) {
	try { //IE
		window.external.addFavorite(sURL, sTitle);
	} catch (e) {
		try { //Firefox
			window.sidebar.addPanel(sTitle, sURL, "");
		} catch (e) {
			try { 
			    //Chrome无法自动收藏，用创建快应用程序的捷方式来替代。
				createShortcut();
			} catch (e) {
				$('.add-fav-pop').addClass('add-fav-active');
			}
		}
	}
}
$(function(){
	$('.add-fav-pop .close-pop').on('click',function(){
		$('.add-fav-pop').removeClass('add-fav-active');
	})
})


// 设为首页
function setHomepage(pageURL) {
	if (document.all) {
		// IE提示层
		$('.set-home-pop').addClass('brower-ie-active').show();

		document.body.style.behavior = 'url(#default#homepage)';
		document.body.setHomePage(pageURL);

	} else {
		try { //IE
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		} catch (e) {
			try { //Firefox
				var prefs = Components.classes['@mozilla.org/preferences-service;1']
					.getService(Components.interfaces.nsIPrefBranch);
				prefs.setCharPref('browser.startup.homepage', pageURL);
			} catch (e) {
				// 非IE提示层
				$('.set-home-pop').addClass('brower-other-active').show();
			}
		}
	}
}
$(function(){
	$(document).on('click',function(){
		// IE提示层
		if($('.set-home-pop').hasClass('brower-ie-active')){
		$('.set-home-pop').removeClass('brower-ie-active').hide();
		}
	})
})



// 返回顶部
$(function(){ 
	var winH=$(window).height();
    var $backToTopTxt="<i></i><em>回顶部</em>", $backToTopEle = $('<div class="gotop"></div>').appendTo($("body"))
        .html($backToTopTxt).attr("title", $backToTopTxt).click(function() {
            $("html, body").animate({ scrollTop:0 }, 200);
      
    }), $backToTopFun = function() {  
        var st = $(document).scrollTop(), winh = $(window).height();
        (st > winH)? $backToTopEle.fadeIn(300): $backToTopEle.fadeOut(300);    
        if (!window.XMLHttpRequest) {
            $backToTopEle.css("top", st + winh - 210);    
        }
    };
    $(window).bind("scroll", $backToTopFun);
    $(function() { $backToTopFun();});
})






// 图片懒加载
$(function() {  
	if($("img.lazy")){
      $("img.lazy").lazyload({
         loading:true,
         effectspeed:200,
         threshold:300,
         effect:"fadeIn",
         //placeholder:"styles/img/pd-lazy-img.jpg",//设置占位图片
         skip_invisible:false
      });
    }
}); 


// 轮播
$(function() {
	if($('.side-ad-slides').length){
	    $('.side-ad-slides').flexslider({
	        animation: "fade",
	        slideshowSpeed:4000,
	        animationSpeed:500,
	        pauseOnAction:false,
	        pauseOnHover:true,
	        controlNav:true,
	        directionNav:true
	    });
	    $('.side-ad-slides .flex-control-paging li a').hover(function(){
	        $(this).trigger('click');
	     })
	}

    // "视频栏目"内容滚动
    if($('.video-slides').length){
	    $('.video-slides').flexslider({
	        animation: "slide",
	        slideshowSpeed:4000,
	        animationSpeed:500,
	        pauseOnAction:false,
	        pauseOnHover:true,
	        controlNav:false,
	        directionNav:true,
	        prevText:'<i></i>',
	        nextText:'<i></i>'
	    });
    }

    // "放松一下"内容滚动
    if($('.joke-slides').length){
	    $('.joke-slides').flexslider({
	        animation: "slide",
	        slideshowSpeed:5000,
	        animationSpeed:800,
	        pauseOnAction:false,
	        pauseOnHover:true,
	        controlNav:true,
	        directionNav:true,
	        itemWidth:170,
	        itemMargin:20,
	        prevText:'<i></i>',
	        nextText:'<i></i>'
	    });
    }
})



$(function(){
	$('.famous-img-list li:nth-child(1)').delay(1500).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(2),.famous-img-list li:nth-child(7)').delay(1800).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(3),.famous-img-list li:nth-child(8),.famous-img-list li:nth-child(13)').delay(2200).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(4),.famous-img-list li:nth-child(9),.famous-img-list li:nth-child(14)').delay(2600).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(5),.famous-img-list li:nth-child(10),.famous-img-list li:nth-child(15)').delay(3000).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(6),.famous-img-list li:nth-child(11),.famous-img-list li:nth-child(16)').delay(3400).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(12),.famous-img-list li:nth-child(17)').delay(3800).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400)
	$('.famous-img-list li:nth-child(18)').delay(4000).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},400).delay(300).animate({
		'opacity':'.7'
	},100).delay(200).animate({
		'opacity':'1'
	},200)
})
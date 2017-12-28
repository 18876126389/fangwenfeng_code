var z={
	get_page_wh:function(mode){	
		if (mode==="h") {
			var h=document.documentElement.clientHeight||window.innerHeight;
			return h;
		}
		if (mode==="w") {
			var w=document.documentElement.clientWidth||window.innerWidth;
			return w;
		}
	},
	html_fontSize:function(num){
		(!num)&&(num=6);
		var html=document.getElementsByTagName('html')[0];
		html.style.fontSize=(this.get_page_wh("w")/num)+"px";
	},
	resize:function(e){
		this.html_fontSize(num);
	},
	init:function(){
		this.html_fontSize();
		window.onload=function(){
			z.html_fontSize();
			setTimeout(function(){
				z.html_fontSize();
			},5000);
		}
		window.onresize=function(){
			z.html_fontSize();
		}
	}
};
z.init();

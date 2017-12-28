var $$=function(key){}
$$.prototype={
	context:function(obj){
		if (obj.getContext) {
			var context=obj.getContext("2d");//创建绘画环境
			return context;
		}
		else{
			return false;
		}
	}
	/*
	*参数：canvas_elementobj,渐变开始x坐标,渐变开始y坐标,渐变结束x坐标,渐变结束y坐标,渐变开始颜色,渐变结束颜色,
	路径坐标x(数组),路径坐标y(数组)  一共9个参数
	*/
	,gradient:function(obj,x0,y0,x1,y1,color0,color1,x_arr,y_arr){
		var context=this.context(obj);
		if (!context) {return false;}
		context.beginPath();
		context.moveTo(x_arr[0],y_arr[0]);//开始位置
		//context.lineTo(x_arr[1],y_arr[1]);
		//context.lineTo(x_arr[2],y_arr[2]);
		if ((typeof x_arr=="object")&&(typeof y_arr=="object")&&(x_arr.length==y_arr.length)) {
			for(var i=1,len=x_arr.length;i<len;i++){
				context.lineTo(x_arr[i],y_arr[i]);
			}
		}
		else{
			return false;
		}
		var gradient=context.createLinearGradient(x0,y0,x1,y1);//渐变范围
		gradient.addColorStop(0,color0);//开始颜色
		gradient.addColorStop(1,color1);//结束颜色
		context.fillStyle=gradient;
		context.fill();
		return context;
		//context.fillRect(x0,y0,x1,y1);
	}
	,render_canvas0:function(color){
		(!color)&&(color="#f0f");
		this.gradient(canvas0,0,0,250,250,"#fff",color,[0,502,0],[0,0,502]);
		this.canvas0=this.gradient(canvas0,500,500,250,250,"#000",color,[500,500,0],[0,500,500]);
		
	}
	,render_canvas1:function(canvas_obj,num,color_arr,h_scale){
		(!h_scale)&&(h_scale=1);
		var w=canvas_obj.offsetWidth;
		var h=canvas_obj.offsetHeight;
		if (typeof color_arr!="object"&&color_arr.length<=num) {
			return false;
		}
		for(var i=1,j=0;i<=num;i++){
			this.canvas1=this.gradient(canvas_obj,w*1*i*h_scale,w*j*h_scale,w*1*i*h_scale,w*1*i*h_scale,color_arr[j],color_arr[i],[w/2,w*1,w*1,0,0,20],[w*j*h_scale,w*j*h_scale,w*i*h_scale,w*i*h_scale,w*j*h_scale,w*j*h_scale]);
			j++;
		}
		//get_color.gradient(canvas1,40,40*1,40*2,40*2,"#f00","#0f0",[40/2,40*1,40*1,40/2],[40*1,40*1,500]);		
	}
	,get_obj_position:function(obj){//获取元素在页面中的位置
		if (obj) {
			return {top:obj.offsetTop,left:obj.offsetLeft};
		}
		else{
			return false;
		}
	}
	,set_obj_position:function(obj,attribute_value){
		obj.setAttribute("style",attribute_value);
	}
	,get_canvas_color:function(context,x,y,w,h){
		(!x)&&(x=0);
		(!y)&&(y=0);
		(!w)&&(w=1);
		(!h)&&(h=1);
		var imgData=context.getImageData(x,y,w,h);
		var data=imgData.data;//一个数组，每4个长度代表一个像素数据rgba
		return {px:data,img_data:imgData};
	},
	return_color:function(e,context){//返回像素颜色数据 鼠标经过的
		var e=e||window.event;
		var target=e.target;
		var m_x=e.pageX;
		var m_y=e.pageY;
		var _left=target.offsetLeft;
		var _top=target.offsetTop;
		var ele_x=m_x-_left;
		var ele_y=m_y-_top;
		return this.get_canvas_color(context,ele_x,ele_y);
	}
}
var get_color=new $$();
function lookColor(data,ele_arr,ele_key,fun){
	for(var i=0,len=data.length;i<len;i++){
		ele_arr[i][ele_key]=data[i];
	}
	(fun)&&(fun(data));
}
function color16(st){
	if (st.toString(16).length<2) {
		st="0"+st.toString(16);
	}
	else{
		st=st.toString(16);
	}
	return st;
}
function point(data){
	var p=container.getElementsByTagName('p');
	p[0].innerHTML=color_look.style.background;
	p[1].innerHTML="#"+color16(data[0])+color16(data[1])+color16(data[2]);
}
function move(e){// 大画布
	lookColor(get_color.return_color(e,get_color.canvas0).px,container.getElementsByTagName('input'),"value",function(data){
		color_look.style.background="rgb("+data[0]+","+data[1]+","+data[2]+")";
		point(data);
	});
	e.target.setAttribute("style","cursor:Crosshair;");
}
function move1(e){//小画布（颜色柱）
	lookColor(get_color.return_color(e,get_color.canvas1).px,container.getElementsByTagName('input'),"value",function(data){
		color_look.style.background="rgb("+data[0]+","+data[1]+","+data[2]+")";
		get_color.render_canvas0("rgb("+data[0]+","+data[1]+","+data[2]+")");
		point(data);
	});
}
get_color.render_canvas0();
get_color.render_canvas1(canvas1,5,["#f00","#f0f","#02d","#0f0","#f6ce19","#f00"],2.5);
//get_color.get_canvas_color(get_color.canvas0,5,5);
canvas0.addEventListener("mousedown",function(e){
	lookColor(get_color.return_color(e,get_color.canvas0).px,container.getElementsByTagName('input'),"value",function(data){
		color_look.style.background="rgb("+data[0]+","+data[1]+","+data[2]+")";
		point(data);
		e.target.setAttribute("style","cursor:Crosshair;");
	});
	canvas0.addEventListener("mousemove",move,false);
},false);
canvas0.addEventListener("mouseup",function(e){
	this.removeEventListener("mousemove",move,false);
	e.target.setAttribute("style","");
},false);

canvas1.addEventListener("mousedown",function(e){
	lookColor(get_color.return_color(e,get_color.canvas1).px,container.getElementsByTagName('input'),"value",function(data){
		color_look.style.background="rgb("+data[0]+","+data[1]+","+data[2]+")";
		get_color.render_canvas0("rgb("+data[0]+","+data[1]+","+data[2]+")");
		point(data);
	});
	canvas1.addEventListener("mousemove",move1,false);
},false);
canvas1.addEventListener("mouseup",function(e){
	this.removeEventListener("mousemove",move1,false);
},false);
container.addEventListener("change",function(e){
	var e=e||window.event;
	var target=e.target||e.srcElement;
	var input=this.getElementsByTagName('input');
	for(var i=0,len=input.length;i<len;i++){
		if (target.type=="number") {
			color_look.style.background="rgb("+input[0].value+","+input[1].value+","+input[2].value+")";
			break;
		}
	}
},false);
color_look.onclick=function(){
	get_color.render_canvas0(this.style.background);
}

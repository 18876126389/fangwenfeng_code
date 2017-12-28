var plugs={
	addEventListener :function(obj,eventtype,fun){
		if(obj.addEventListener){
			obj.addEventListener(eventtype,fun,false);
		}
		else if(obj.attachEvent){
			obj.attachEvent("on"+eventtype,fun);
		}
		else{
			obj["on"+eventtype]=fun;
		}
	},
	removeEventListener :function(obj,eventtype,fun){
		if (obj.removeEventListener) {
			obj.removeEventListener(eventtype,fun,false);
		}
		else if (obj.detachEvent) {
			obj.detachEvent("on"+eventtype,fun);
		}
		else{
			obj["on"+eventtype]=null;
		}
	},
	getEvent :function(event){		//获取事件对象
		return event ? event:window.event;
	},
	getTarget :function(event){		//返回事件目标
		return event.target||event.srcElement;
	},
	getKeyCode:function(e){/*获取键盘按键值*/
		var keyCode=e.keyCode||window.event.keyCode;
		return keyCode;
	},
	getMouseButton:function(e){/*获取鼠标按键值*/
		var button=e.button||window.event.button;
		return button;
	},
	preventDefault :function(event){	//取消默认事件行为
		if(event.preventDefault){
			event.preventDefault();
		}
		else{
			event.returnValue=false;
		}
	},
	stopPropagation :function(event){
		if (event.stopPropagation) {
			event.stopPropagation();
		}
		else{
			event.cancelBubble=true;
		}
	},
	drawing:function(obj,json,time){//运动插件
		if (time==null) {time=1000;}
		obj.stop=false;//设置开关
		clearInterval(obj.t);//先停止上一次的计时器
		obj.t=setInterval(function(){
			for(var attr in json){
				var css=parseInt(getComputedStyle(obj)[attr]);//获取对象样式表的css样式
				var v=(json[attr]-css)/(time/100);//设置运动速度 大约除以10为1秒
				if (v>0) {
					v=~~v+1;
				}else{
					v=~~v;//向下取整
				}
				obj.style[attr]=css+v+"px";
				if (v<1) {obj.stop=true;}
				if (obj.stop) {clearInterval(obj.t);}
			}
		},1000/60);
	},
	//元素插入 参数：父元素 创建元素名称 元素属性（标签里的属性）元素属性 元素个数 回调函数
	insertElements:function(parent_element,element_name,jsonsetAttribute,jsonAttr,element_num,fun){
		(!element_num)&&(element_num=1);
		var Fragment=document.createDocumentFragment();
		for(var i=0;i<element_num;i++){
			var E=document.createElement(element_name);
			if (jsonsetAttribute) {
				for(var attr in jsonsetAttribute){
					E.setAttribute(attr,jsonsetAttribute[attr]);
				}
			}
			if (jsonAttr) {
				for(var attributes in jsonAttr){
					E[attributes]=jsonAttr[attributes];
				}
			}
			if (fun) {
				fun(E);/*E--->parent_element*/
			}
			Fragment.appendChild(E);
		}
		parent_element.appendChild(Fragment);
	},
	/*插入单个元素并设置元素属性
	*参数：插入的范围（父元素）,元素名,元素属性(json格式),回调函数(两个参数),参考对象（某个元素前面）
	*/
	insertElement:function(parent_obj,ele_name,ele_attribute_json,fun,child_obj){
		function set_obj_attribute(obj,obj_att_json){/*设置对象属性*/
			if (obj) {
				if (typeof obj_att_json=="object" ) {
					for(var attr1 in obj_att_json){
						if (typeof obj_att_json[attr1]=="object") {
							obj[attr1]={};
							set_obj_attribute(obj[attr1],obj_att_json[attr1]);
						}
						else{
							obj[attr1]=obj_att_json[attr1];
						}	
					}
				}
			}
		}
		if (!parent_obj||!ele_name||!ele_attribute_json) {
			return false;
		}
		var E=document.createElement(ele_name);
		set_obj_attribute(E,ele_attribute_json);
		//this.set_obj_att(E,ele_attribute_json);
		(fun)&&(fun(E,this));
		child_obj?parent_obj.insertBefore(E,child_obj):parent_obj.appendChild(E);	
	},
	//文件批量上传 参数：文件数组集合 地址
	ajax_file_upload:function(file_arr,url,fun){/*ajax文件批量上传*/
		if (file_arr) {
			var data=new FormData();
			for(var i=0,len=file_arr.length;i<len;i++){
				data.append("file"+i,file_arr[i]);
			}
			var xhr=new XMLHttpRequest();
			xhr.open("post",url,true);
			xhr.onreadystatechange=function(e){
				if (xhr.readyState==4&&xhr.status>=200) {
					alert(xhr.responseText);
					var xhr_obj=this;
					var texts=this.responseText;
					(fun)&&(fun(xhr_obj,texts));
				}
			}
			xhr.send(data);
		}
	},
	//图片预览 参数：文件对象 图片对象（img元素）
	imglook:function(file,image_obj){/*图片预览*/
		var reader=new FileReader();/*读取文件功能对象*/
		if (/image/.test(file.type)) {
			reader.readAsDataURL(file);/*文件数据转码 data:xxx*/
			reader.onload=function(){
				(image_obj)&&(image_obj.src=reader.result);
				reader.onload=null;
			}
			
			return reader.result;
		}
		else{
			reader.readAsText(file);
			return reader.result;
		}
	},
	xhr:function(methon,url,fun,form_obj) {
		var xhr=new XMLHttpRequest();
		xhr.open(methon,url,true);
		xhr.onreadystatechange=function(e){
			if (this.readyState==4&&this.status>=200) {
				var texts=this.responseText;
				if (fun) {
					fun(this,texts);
				}
			}
		}
		if (form_obj) {
			//xhr.setRequestHeader("Content-Type:","application/x-www-form-urlencoded");
			xhr.send(new FormData(form_obj));
		}
		else{
			xhr.send();
		}	
	},
	/*
	*分页函数 参数说明：数组json数据,对象(元素标签),每页显示数量,模式,回调函数(传入一个JSON),默认回调函数（可以不写）
	*/
	page_data:function(arr_json,obj,num,mode,fun,dfun){//控制 数组数据长度
		(!obj.str)&&(obj.str='');
		(!obj.page)&&(obj.page=0);
		var max_len=arr_json.length;
		var max_page=~~(max_len/num);//最大页数
		(max_len%num==0)&&(max_page=~~(max_len/num)-1);//最大页数
		var min_page=0;//最小页数
		(mode=="L"||mode=="left")&&(obj.page--);//上一页
		(mode=="R"||mode=="right")&&(obj.page++);//下一页
		(mode=="T"||mode=="top")&&(obj.page=0);//首页
		(mode=="B"||mode=="bottom")&&(obj.page=max_page);//末页
		(obj.page>=max_page)&&(obj.page=max_page);//限制最大页
		(obj.page<=0)&&(obj.page=0);//限制最小页
		var len=(obj.page+1)*num>max_len?max_len:(obj.page+1)*num;
		for(var i=obj.page*num;i<len;i++){
			obj.str+=fun(arr_json[i]);//这里的回调函数fun函数要返回一个值（字符串）
		}
		if (dfun) {
			obj.innerHTML=obj.str+dfun();
			obj.str="";
		}
		else{
			obj.innerHTML=obj.str;
			obj.str="";
		}
	},
	/*参数说明：获取元素的范围 元素属性名 元素属性值 是否是自定义属性 元素名称*/
	getElements:function(obj_range,attribute_name,attribute_value,myatt,tagName){
		(!myatt)&&(myatt=false);
		var arr_element=[];//保存选取的元素
		if (obj_range==null||obj_range==0||obj_range==false) {
			obj_range=document;
		}
		var elements=obj_range.getElementsByTagName('*');
		if (tagName) {
			return obj_range.getElementsByTagName(tagName);
		}
		for(var i=0,len=elements.length,j=0;i<len;i++){
			if (myatt) {//获取自定义属性元素
				if (elements[i]['dataset'][attribute_name]==attribute_value) {
					arr_element[j]=elements[i];
					j++;
				}				
			}
			else{
				if (elements[i][attribute_name]==attribute_value) {
					arr_element[j]=elements[i];
					j++;
				}				
			}
		}
		return arr_element;
	},
	get_form_elements:function(formElement,elementName){//获取表单里面的元素如input select等
		if (formElement) {
			if (elementName) {
				var arr=[];
				for(var i=0,len=formElement.elements.length,j=0;i<len;i++){
					if (formElement.elements[i].tagName.toLocaleLowerCase()==elementName) {//把标签名转为小写
						arr[j]=formElement.elements[i];
						j++;
					}
				}
				return arr;
			}
			else{
				return formElement.elements;
			}	
		}
	},
	/*页面渲染*/
	page:{
		/*渲染(内容改变)的范围 数组JSON数据 回调函数（返回一个字符串或文本域`xx` 必须又有一个参数来接收JSON数据）*/
		render:function(obj,arr_json,fun){
			var html="";
			for(var i=0,len=arr_json.length;i<len;i++){
				html+=fun(arr_json[i]);
			}
			obj.innerHTML=html;
		},
		/*渲染(内容改变)的范围,数据json数据,回调函数(返回一个字符串 有两个参数：接收json数据,计数（数组下标）)*/
		render_1:function(obj,arr_json,fun){
			if (arr_json&&(typeof arr_json=="object")&&arr_json.length>0) {
				var html="";
				for(var i=0,len=arr_json.length;i<len;i++){
					if (fun) {
						html+=fun(arr_json[i],i);
					}
				}
				obj.innerHTML=html;
			}
		},
		/*
		*参数说明：数组JSON数据 显示的数量 模式 全局变量名称
		*处理数组json数据,然后返回处理好的数组JSON数据 控制显示数量
		*/
		mode:function(arr_json,num,mode,obj){
			(!obj.page)&&(obj.page=0);
			var arr_data=[];
			var leng=arr_json.length;
			(num>=leng)&&(num==leng);
			(num<=0)&&(num=0);
			var max_page=leng%num==0 ? ~~(leng/num)-1 : ~~(leng/num);
			var len=(obj.page+1)*num>=leng ? leng : (obj.page+1)*num;
			if (mode=="random"||mode=="rand") {//随机排序
				for(var i=0;i<num;i++){
					arr_data[i]=arr_json[~~(Math.random()*leng)];
				}
			}
			switch(true){
				case mode=="l"||mode=="left":
					for(var i=obj.page*num,j=0;i<len;i++){
						arr_data[j]=arr_json[i];
						j++;
					}
					obj.page--;
					(obj.page<=0)&&(obj.page=0);
				break;
				case mode=="r"||mode=="right":
					for(var i=obj.page*num,j=0;i<len;i++){
						arr_data[j]=arr_json[i];
						j++;
					}
					obj.page++;	
					(obj.page>=max_page)&&(obj.page=max_page);				
				break;
				case mode=="t"||mode=="top":
					for(var i=0,j=0;i<len;i++){
						arr_data[j]=arr_json[i];
						j++;
					}
					obj.page=0;
				break;
				case mode=="b"||mode=="bottom":
					for(var i=max_page*num,j=0;i<leng;i++){
						arr_data[j]=arr_json[i];
						j++;
					}
					obj.page=max_page;					
				break;
				default:
					for(var i=0;i<num;i++){
						arr_data[i]=arr_json[~~(Math.random()*leng)];
					}
				break;
			}
			return arr_data;
		},
		/*数组JSON数据,显示的数量,模式,对象（用来存储处理好的数据数组，也可以不填）*/
		mode_1:function(json_arr,num,mode,obj){//返回一个二维数组数据（多个一维数组json数据组成）
			var arr=[];
			var x=0;
			arr[x]=[];
			if (json_arr&&(typeof json_arr=="object")&&json_arr.length>0) {
				switch(true){
					case mode=="rand"||mode=="random":
						var leng=json_arr.length;
						for(var i=0;i<num;i++){
							arr[x][i]=json_arr[~~(Math.random()*leng)];
						}				
					break;
					default:
						for(var i=0,len=json_arr.length,j=0;i<len;i++){
							arr[x][j]=json_arr[i];
							j++;
							if (j>num-1) {
								j=0;
								x++;
								arr[x]=[];
							}
						}
						if (arr[x].length<1) {
			  				arr.length=x;
						}
					break;
				}
				(obj)&&(obj.page_data=arr);
				return arr;
			}
			else{
				return false;
			}
		},
		page_num:function(arr_json,num,mode,key){/*分页计数控制*/
			(!num)&&(num=10);
			(!key)&&(key="key_num");
			(!window[key])&&(window[key]=0);
			var arr_data=(mode=="rand"||mode=="random")?plugs.page.mode_1(arr_json,num,"rand"):plugs.page.mode_1(arr_json,num);
			var len=arr_data.length-1;/*数组最大下标*/
			if (mode=="l"||mode=="left") {
				window[key]--;
			}
			if (mode=="r"||mode=="right") {
				window[key]++;
			}
			if (mode=="t"||mode=="top") {
				window[key]=0;
			}
			if (mode=="b"||mode=="bottom") {
				window[key]=len;
			}	
			(window[key]<=0)&&(window[key]=0);	
			(window[key]>len)&&(window[key]=len);	
			return arr_data[window[key]];
		},
		paging:function(mode,number,arr_json,key,key1){/*模式,数组json数据,回调函数,属性名（键值）存储处理好的数组,键值（分页计数属性）  分页*/
			(!key)&&(key="arr2");(!key1)&&(key1="num");
			(!plugs.p_data[key1])&&(plugs.p_data[key1]=0);
			if (arr_json&&(typeof arr_json=="object")&&arr_json.length>0) {
				(!plugs.p_data[key])&&(plugs.p_data[key]=plugs.page.mode_1(arr_json,number));
			}
			else{
				return false;
			}
			var len=plugs.p_data[key].length-1;
			switch(true){
				case mode=="l"||mode=="left" :
					plugs.p_data[key1]--;
				break;
				case mode=="r"||mode=="right" :
					plugs.p_data[key1]++;
				break;
				case mode=="t"||mode=="top" :
					plugs.p_data[key1]=0;
				break;
				case mode=="b"||mode=="bottom" :
					plugs.p_data[key1]=len;
				break;
				default:
					return plugs.page.mode_1(arr_json,number,"rand");
				break;
			}
			(plugs.p_data[key1]<=0)&&(plugs.p_data[key1]=0);
			(plugs.p_data[key1]>=len)&&(plugs.p_data[key1]=len);
			return plugs.p_data[key][plugs.p_data[key1]];/*返回一个 数组JSON数据*/

		}
	},
	/*
	*设置元素属性、样式值
	*参数说明：元素标签对象 json格式{xx:"xxx"} json格式{xx:"xxx"} json格式2层属性{xx:{xx:"xx"}}
	*/
	set_element_att:function(obj,json_setAttribute,json_attribute){
		if (!obj) {
			return false;
		}
		if (json_setAttribute) {
			for(var setAttr in json_setAttribute){
				obj.setAttribute(setAttr,json_setAttribute[setAttr]);
			}
		}
		if (json_attribute) {
			for(var attr in json_attribute){
				if (typeof json_attribute[attr]=="object") {
					obj[attr]={};
					for(var attr_2 in json_attribute[attr]){
						obj[attr][attr_2]=json_attribute[attr][attr_2];
						if (typeof json_attribute[attr][attr_2]=="object") {
							plugs.set_element_att(obj[attr],false,json_attribute[attr][attr_2]);/*递归调用*/
						}
					}
				}
				else{
					obj[attr]=json_attribute[attr];
				}	
			}
		}
	},
	set_obj_attribute:function(obj,json_att){
		if (!obj) {
			return false;
		}
		if (json_att) {
			for(var attr in json_att){
				if (typeof json_att[attr]=="object") {
					obj[attr]={};
					for(var attr_2 in json_att[attr]){
						obj[attr][attr_2]=json_att[attr][attr_2];
						if (typeof json_att[attr][attr_2]=="object") {
							plugs.set_obj_attribute(obj[attr],json_att[attr][attr_2]);/*递归调用*/
						}
					}
				}
				else{
					obj[attr]=json_att[attr];
				}	
			}			
		}	
	},
	set_obj_att:function(obj,obj_att_json){/*/*设置对象属性*/
			if (obj) {
				if (typeof obj_att_json=="object" ) {
					for(var attr1 in obj_att_json){
						if (typeof obj_att_json[attr1]=="object") {
							obj[attr1]={};
							this.set_obj_att(obj[attr1],obj_att_json[attr1]);
						}
						else{
							obj[attr1]=obj_att_json[attr1];
						}
						
					}
				}
				else{
					return false;
				}
			}
			else{
				return false;
			}
	},
	/*获取地址栏参数记？后面部分*/
	methon_get:function(obj,key_name){/*对象,属性名*/
		var url=decodeURI(location.href);/*解码*/
		var arr=[];
		var json={};
		if (/php\?/i.test(url)||/html\?/i.test(url)||/\?/i.test(url)) {
			var str_url=url.split("?")[1];
			arr=str_url.split("&");/*字符分割后放到数组里*/
			for(var i=0,len=arr.length;i<len;i++){
				var st=arr[i].split("=");
				json[st[0]]=st[1];
			}
			(obj)&&(obj[key_name]={})&&(obj[key_name]=json);
			return json;
		}
		else{
			return false;
		}
	},
	p_data:{/*用来临时存储页面数据或对象等*/}
};
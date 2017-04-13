(function(){
	GestureLock = function(canvas) {
		this.canvas = canvas;
		this.canW = 0; //canvas的宽度
		this.context = null; //canvas的上下文
		this.buttons = {}; //画图案时未经过的所有点
		this.selected = {}; //画图案时经过的所有点
		this.selectedOrder = []; //画图案是经过的所有点的顺序
		this.r = 0;  //按钮的半径
		this.isTarget = false;//是否从button处开始mousemove
		this.isEnd = true; //是否结束
		this.curTarget = 0; //当前选定的button
		this.password = localStorage.getItem("password"); //获取存在localstorage中的密码
		this.newPassword = ''; //设置密码时首次输入的密码
		this.message = document.getElementById("message");
		this.checkbox = document.getElementsByName("changepassword");
	};
	
	GestureLock.prototype.init = function() {//1.初始化canvas的高度和宽度 2.画出9个按钮，3.为canvas绑定事件
		this.canW = this.winH = document.documentElement.clientWidth;
		this.r = this.canW / 15;
		this.canvas.width = this.canW;
		this.canvas.height = this.canW ;
		this.context = this.canvas.getContext("2d");
		this.getButtons();
		this.drawButtons();
		this.EventUtil();
		
	};
	
	GestureLock.prototype.getButtons = function() { // 获取9个按钮的x，y值
		var key = 1;
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				var button = {
					x: (4 * i + 3.5) * this.r, 
					y:(4 * j + 3.5) * this.r
					
				};
				this.buttons[key++] = button;
			}
		}
	};
	
	GestureLock.prototype.drawButtons = function() { //画出画布上的9个按钮
		this.context.fillStyle = "#fff"; // 画出未选中的按钮
		this.context.strokeStyle = "#999";
		for(var i in this.buttons) {
			this.context.beginPath();
			this.context.arc(this.buttons[i].x, this.buttons[i].y, this.r, 0, 2 * Math.PI, false);
			this.context.closePath();
			this.context.stroke();
			this.context.fill();
		}
		this.context.fillStyle = "#FFFF00";//画出已选中的按钮
		for(var i = 0, len = this.selectedOrder.length; i < len; i++) {
			this.context.beginPath();
			this.context.arc(this.selected[this.selectedOrder[i]].x, this.selected[this.selectedOrder[i]].y, this.r, 0, 2 * Math.PI, false);
			this.context.closePath();
			this.context.stroke();
			this.context.fill();
		}
	};
	
	GestureLock.prototype.EventUtil = function() {//为canvas绑定事件
		var self = this;
		this.canvas.addEventListener("touchstart", function(e) {
			var eventX = e.touches[0].clientX;
			var eventY = e.touches[0].clientY;
			for(var i in self.buttons) {
				if(Math.abs(self.buttons[i].x - eventX) < self.r && Math.abs(self.buttons[i].y - eventY) < self.r) {
					self.selected[i] = self.buttons[i];
					self.selectedOrder.push(i);
					self.curTarget = i;
					delete self.buttons[i];
					self.isTarget = true;
					self.isEnd = false;
					break;
				}
			}
		}, false);
		this.canvas.addEventListener("touchmove", function(e) {
			if(self.isTarget) {
				var eventX = e.touches[0].clientX;
				var eventY = e.touches[0].clientY;
				self.reDraw(eventX, eventY);
			}
		}, false);
		
		this.canvas.addEventListener("touchend", function(e) {
			if(self.isTarget) {
				self.isEnd = true;
				self.isTarget = false;
				self.reDraw();
			}
		}, false);
	};
	
	GestureLock.prototype.reDraw = function(x, y) { //重绘画面
		this.context.clearRect(0 , 0 ,this.canW , this.canW);
		if(!this.isEnd) {
			for(var i in this.buttons) {
				if(Math.abs(this.buttons[i].x - x) < this.r && Math.abs(this.buttons[i].y - y) < this.r) {
					this.findMid(i);//防止越过中间的点选择第三个点时，中间的点不被选中
					this.selected[i] = this.buttons[i];
					this.selectedOrder.push(i);
					this.curTarget = i;
					delete this.buttons[i];
					break;
				}
			}
		}
		
		this.drawButtons();
		this.drawSelectedLines(x, y);
	};
	
	GestureLock.prototype.findMid = function(i) {//如果在i和curtarget之间有点的话，需要将这个点放到selected中
		switch(i) {
			case '1': {
				switch(this.curTarget) {
					case '3': this.selectMid('2'); return;
					case '7': this.selectMid('4'); return;
					case '9': this.selectMid('5'); return;
					default: return;
				}
			}
			case '2': {
				switch(this.curTarget) {
					case '8': this.selectMid('5'); return;
					default: return;
				}
			}
			case '3': {
				switch(this.curTarget) {
					case '1': this.selectMid('2'); return;
					case '7': this.selectMid('5'); return;
					case '9': this.selectMid('6'); return;
					default: return;
				}
			}
			case '4': {
				switch(this.curTarget) {
					case '6': this.selectMid('5'); return;
					default: return;
				}
			}
			case '6': {
				switch(this.curTarget) {
					case '4': this.selectMid('5'); return;
					default: return;
				}
			}
			case '7': {
				switch(this.curTarget) {
					case '1': this.selectMid('4'); return;
					case '3': this.selectMid('5'); return;
					case '9': this.selectMid('8'); return;
					default: return;
				}
			}
			case '8': {
				switch(this.curTarget) {
					case '2': this.selectMid('5'); return;
					default: return;
				}
			}
			case '9': {
				switch(this.curTarget) {
					case '1': this.selectMid('5'); return;
					case '3': this.selectMid('6'); return;
					case '7': this.selectMid('8'); return;
					default: return;
				}
			}
		}
	};
	
	GestureLock.prototype.selectMid = function(n) {//这个点若是已经存在在seleted中则不管，否则将它加入selected中
		if(!this.selected[n]) { 
			this.selected[n] = this.buttons[n];
			delete this.buttons[n];
			this.selectedOrder.push(n);
		}
	};
	
	GestureLock.prototype.drawSelectedLines = function(x, y) { //画出所有的连接线
		if(this.selectedOrder.length > 1) { //如果已选择的button超过一个则要在他们之间画上连接线
			this.context.moveTo(this.selected[this.selectedOrder[0]].x, this.selected[this.selectedOrder[0]].y);
			for(var i = 1, len = this.selectedOrder.length; i < len; i++) {
				this.context.lineTo(this.selected[this.selectedOrder[i]].x, this.selected[this.selectedOrder[i]].y);
			}
			this.context.stroke();
		}
		if(!this.isEnd) {
			this.context.moveTo(this.selected[this.curTarget].x, this.selected[this.curTarget].y);
			this.context.lineTo(x, y);
			this.context.stroke();
		} else {//如果结束的话
			this.changeText();
		}
		
	};
	
	GestureLock.prototype.changeText = function() { //密码输入完成后需要切换状态
		var self = this;
		if(this.checkbox[0].checked) {//设置密码 
			if(this.selectedOrder.length < 5) {//密码少于5个点
				this.message.innerHTML = "密码不能小于5五个点";
			} else {
				if(this.newPassword == '') {//设置第一次密码
					this.newPassword = this.selectedOrder.toString();
					this.message.innerHTML = "请再次输入手势密码";
				} else { //设置第二次密码
					if(this.selectedOrder.toString() == this.newPassword) { //第二次与第一次相同
						this.message.innerHTML = "密码设置成功";
						this.password = this.newPassword;
						localStorage.setItem('password', this.password.toString());
						this.newPassword = '';
					} else {//第二次与第一次不相同
						this.message.innerHTML = "两次输入不一致，请重新设置";
						this.newPassword = '';
					}
				}
			}
		}else {//验证密码
			this.newPassword = '';
			if(this.selectedOrder.toString() == this.password) {
				this.message.innerHTML = "密码正确！";
			} else {
				this.message.innerHTML = "密码不正确";
			}
			
		}
		setTimeout(function(){
					self.reset();
				}, 500);
	};
	
	GestureLock.prototype.reset = function() { //密码输入完成后0.5s后重置画面
		for(var i in this.selected) {
			this.buttons[i] = this.selected[i];
			delete this.selected[i];
		}
		this.selectedOrder.length = 0;
		this.context.clearRect(0, 0, this.canW, this.canW);
		this.drawButtons();
	};
})();

var canvas = document.getElementById("canvas");
var lock = new GestureLock(canvas);
lock.init();
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();
var loveTimer = null;          // 计时器

// 状态变量
var currentScale = 1.0;        // 当前缩放比例
var scaleStep = 0.1;           // 每次点击缩小10%
var minScale = 0.1;            // 最小缩放比例
var currentSpeed = 50;         // 当前绘制速度（毫秒）
var isFillingActive = false;   // 是否允许填充
var together = null;           // 计时开始时间
var outerLayerBloomCount = 0;  // 最外层花朵数量
$(function () {
	$loveHeart = $("#loveHeart");
	var a = $loveHeart.width() / 2;
	var b = $loveHeart.height() / 2 - 55;
	$garden = $("#garden");
	gardenCanvas = $garden[0];
	gardenCanvas.width = $("#loveHeart").width();
	gardenCanvas.height = $("#loveHeart").height();
	gardenCtx = gardenCanvas.getContext("2d");
	gardenCtx.globalCompositeOperation = "lighter";
	garden = new Garden(gardenCtx, gardenCanvas);
	$("#content").css("width", $loveHeart.width() + $("#code").width());
	$("#content").css("height", Math.max($loveHeart.height(), $("#code").height()));
	$("#content").css("margin-top", Math.max(($window.height() - $("#content").height()) / 2 - 50, 10));
	$("#content").css("margin-left", Math.max(($window.width() - $("#content").width()) / 2, 10));
	setInterval(function () {
		// garden.ctx.clearRect(0, 0, gardenCanvas.width, gardenCanvas.height); // 清空画布
		garden.render();                  // 渲染心形花朵
		garden.updateFallingPetals();    // 渲染掉落花瓣
	}, Garden.options.growSpeed);

	// 点击爱心区域填充新花朵
	$("#loveHeart").click(function () {
		fillMoreBlooms();
	});

	// 使用事件委托绑定按钮点击（支持动态生成的按钮）
	$("#code").click(function (e) {
		if ($(e.target).is("#startOurTimeBtn") || $(e.target).attr("id") === "startOurTimeBtn") {
			// $(e.target).fadeOut();
			startTimer();
		}
		if ($(e.target).is("#startBtn")) {
			// $(e.target).fadeOut();
			startTimer();
		}
	});
});
$(window).resize(function () {
	var b = $(window).width();
	var a = $(window).height();
	if (b != clientWidth && a != clientHeight) {
		location.replace(location)
	}
});

function getHeartPoint(c) {
	var b = c / Math.PI;
	var a = 19.5 * (16 * Math.pow(Math.sin(b), 3));
	var d = -20 * (13 * Math.cos(b) - 5 * Math.cos(2 * b) - 2 * Math.cos(3 * b) - Math.cos(4 * b));
	return new Array(offsetX + a, offsetY + d)
}



function startHeartAnimation() {
	// 重置状态
	currentScale = 1.0;
	currentSpeed = 50;
	isFillingActive = false;
	outerLayerBloomCount = 0;

	// 在初始曲线上创建花朵（外圈）
	createHeartCurve(1.0, currentSpeed, function (count) {
		outerLayerBloomCount = count;
		isFillingActive = true;
		console.log("初始花朵创建完成，缩放比例：" + currentScale + "，花朵数量：" + count);
	});
}

// 在指定缩放比例的曲线上创建花朵
function createHeartCurve(scale, speed, callback) {
	var tMin = 10;
	var tMax = 30;
	var bloom = new Array();
	var c = speed;
	var d = tMin;
	var bloomCount = 0; // 统计花朵数量

	var a = setInterval(function () {
		var h = getHeartPoint(d);
		// 应用缩放：将点向中心缩放
		var centerX = offsetX;
		var centerY = offsetY;
		var scaledX = centerX + (h[0] - centerX) * scale;
		var scaledY = centerY + (h[1] - centerY) * scale;

		var e = true;
		for (var f = 0; f < bloom.length; f++) {
			var g = bloom[f];
			var j = Math.sqrt(Math.pow(g[0] - scaledX, 2) + Math.pow(g[1] - scaledY, 2));
			if (j < Garden.options.bloomRadius.max * 1.3) {
				e = false;
				break
			}
		}
		if (e) {
			bloom.push([scaledX, scaledY]);
			garden.createRandomBloom(scaledX, scaledY);
			bloomCount++;
		}
		if (d >= tMax) {
			clearInterval(a);
			if (callback) callback(bloomCount);
		} else {
			d += 0.2
		}
	}, c)
}

// 点击爱心区域填充新花朵
function fillMoreBlooms() {
	if (!isFillingActive) return;

	// 缩小10%
	currentScale -= scaleStep;

	// 加快绘制速度（每次减少5ms，最低10ms）
	currentSpeed = Math.max(10, currentSpeed - 5);

	console.log("缩小曲线，新缩放比例：" + currentScale + "，绘制速度：" + currentSpeed + "ms");

	// 检查是否已经填满（缩放比例太小）
	if (currentScale <= minScale) {
		isFillingActive = false;
		console.log("曲线已填满，开始打字效果");
		setTimeout(function () {
			startTypewriter();
		}, 500);
		return;
	}

	// 在缩小的曲线上创建花朵
	isFillingActive = false; // 暂时禁用点击，防止重复触发
	createHeartCurve(currentScale, currentSpeed, function () {
		isFillingActive = true;
		console.log("当前曲线花朵创建完成");
	});
}

// 开始打字效果
function startTypewriter() {
	console.log("清空画布并重新绘制爱心");

	// 清空画布和所有花朵
	garden.clear();
	garden.fallingPetals = [];

	// 重新绘制爱心（最外层）
	currentScale = 1.0;
	currentSpeed = 50;
	createHeartCurve(1.0, currentSpeed, function (count) {
		outerLayerBloomCount = count;
		console.log("爱心重新绘制完成，花朵数量：" + count);
	});

	// 开始打字效果
	$("#code").css("display", "block");
	$("#code").typewriter();
	// "Start our time" 按钮会在打字效果中自动显示
}

// 开始计时
function startTimer() {
	console.log("保留外层花朵并开始计时");
	if (loveTimer) {
		console.log("已经计时直接返回");
		
		return 
	}
	// 保留最外层的花朵，移除其他花朵
	if (garden.blooms.length > outerLayerBloomCount) {
		garden.blooms = garden.blooms.slice(0, outerLayerBloomCount);
	}
	garden.fallingPetals = [];

	// 在爱心中间显示计时器
	$("#messages").html('<div style="text-align: center; font-family: sans-serif; font-size: 20px; color: #666;">Every moment from now on</div><div id="elapseClock" style="text-align: center; font-family: digit; font-size: 32px; color: #ff69b4; margin-top: 10px;"></div>');
	$("#messages").css("display", "block");

	// 调整位置到爱心中间
	$("#words").css("position", "absolute");
	$("#words").css("top", ($("#garden").height() - $("#words").height()) / 2 - 120);
	$("#words").css("left", ($("#garden").width() - $("#words").width()) / 2);

	// 开始计时
	together = new Date();
	timeElapse(together);


	loveTimer = setInterval(function () {
		timeElapse(together);
	}, 500);
}

(function (a) {
	a.fn.typewriter = function () {
		this.each(function () {
			var d = a(this), c = d.html(), b = 0;
			d.html("");
			var e = setInterval(function () {
				var f = c.substr(b, 1);
				if (f == "<") {
					b = c.indexOf(">", b) + 1
				} else {
					b++
				}
				d.html(c.substring(0, b) + (b & 1 ? "_" : ""));
				if (b >= c.length) {
					clearInterval(e)
				}
			}, 75)
		});
		return this
	}
})(jQuery);


function timeElapse(c) {
	var e = Date();
	var f = (Date.parse(e) - Date.parse(c)) / 1000;
	var g = Math.floor(f / (3600 * 24));
	f = f % (3600 * 24);
	var b = Math.floor(f / 3600);
	if (b < 10) {
		b = "0" + b
	}
	f = f % 3600;
	var d = Math.floor(f / 60);
	if (d < 10) {
		d = "0" + d
	}
	f = f % 60;
	if (f < 10) {
		f = "0" + f
	}
	var a = '<span class="digit">' + g + '</span> days <span class="digit">' + b + '</span> hours <span class="digit">' + d + '</span> minutes <span class="digit">' + f + "</span> seconds";
	$("#elapseClock").html(a)
}

function showMessages() {
	adjustWordsPosition();
	$("#messages").fadeIn(5000, function () {
		showLoveU()
	})
}

function adjustWordsPosition() {
	$("#words").css("position", "absolute");
	$("#words").css("top", $("#garden").position().top + 195);
	$("#words").css("left", $("#garden").position().left + 70)
}

function adjustCodePosition() {
	$("#code").css("margin-top", ($("#garden").height() - $("#code").height()) / 2)
}

function showLoveU() {
	$("#loveu").fadeIn(3000)
};

function FallingPetal(x, y, color) {
	this.pos = new Vector(x, y);        // 花瓣当前位置
	this.vel = new Vector(Garden.random(-0.5, 0.5), Garden.random(1, 2)); // 速度，X有随机漂移，Y向下
	this.radius = Garden.random(2, 4); // 花瓣大小
	this.angle = Garden.random(0, 360); // 旋转角度
	this.color = color || "rgba(255, 192, 203, 0.8)"; // 默认粉色花瓣
}

FallingPetal.prototype = {
	update: function () {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.angle += 0.05; // 花瓣旋转
	},
	draw: function (ctx) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.angle);
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.ellipse(0, 0, this.radius, this.radius * 1.5, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	},
	isOutOfCanvas: function (height) {
		return this.pos.y > height + 10;
	}
};
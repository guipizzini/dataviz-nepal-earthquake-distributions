
var Vizlib = function(sources, callback){

	// VARIABLE DECLARATION
	var svg;
	var logging = true;
	// counters to handle multiple defs for arrows and patterns
	var arrow = 0;
	var patternId = 0;
	// some default colour ranges
	var color = ['#7A7A7A', '#BFBFBF', 'purple'];

	//*****************************
	// LOAD DATA
	//*****************************

	if(arguments.length == 2){

		var data = [];

		var runstr = 'queue()';

		sources.forEach(function(d,i) {

			var noCache = new Date().getTime();
			var method = 'd3.json';
			if(d.source.indexOf(".json") > -1){ method = 'd3.json';};
			if(d.source.indexOf(".csv") > -1){ method = 'd3.csv';};
			if(d.source.indexOf(".svg") > -1){ method = 'd3.xml';};
			if(d.source.indexOf(".xlsx") > -1){ method = 'd3.xml';};

			if((sources.length-1)!=i){
				runstr += '.defer('+method+', "'+d.source+'?_='+noCache+'")';
			} else {
				runstr += '.defer('+method+', "'+d.source+'?_='+noCache+'").await(function(){for (i = 1; i < arguments.length; i++) { data[sources[i-1].name] = arguments[i];}; callback(data); });';
			}
		});

			console.log(runstr);

		eval(runstr);
	}

	//*******************************
	// FRAME HANDLING
	//*******************************

	var activeFrame = 1;
	var maxFrames = 4;

	this.maxFrames = function(max){
		maxFrames = max;
	};

	this.gotoFrame = function(frame, duration){
		loadFrame(frame, duration);
	}

	function loadFrame(frame, duration){

		// $('#leftButton').show();
		// $('#rightButton').show();

		activeFrame = frame;

		d3.selectAll('.frame')
		.transition()
		.duration(duration)
		// .style('visibility', 'hidden');
		.style('opacity', 0)
		.style('display', 'none');

		d3.selectAll('.frame'+frame)
		.transition()
		.duration((duration))
		.style('opacity', 1)
		// .style('visibility', 'visible');
		.style('display', 'block');

		if(activeFrame==1){
			$('#framePrev').prop('disabled', true);
			// $('#leftButton').hide();
			// $('#rightButton').show();
		} else {
			$('#framePrev').prop('disabled', false);
		}

		if(activeFrame==maxFrames){
			$('#frameNext').prop('disabled', true);
			// $('#leftButton').show();
			$('#rightButton').hide();
		} else {
			$('#frameNext').prop('disabled', false);
			// $('#leftButton').show();
			// $('#rightButton').show();
		}
	}

	this.nextFrame = function(duration){
		activeFrame++;
		this.gotoFrame(activeFrame, duration);
		return activeFrame;
	}

	this.prevFrame = function(duration){
		activeFrame = activeFrame - 1;
		this.gotoFrame(activeFrame, duration);
		return activeFrame;
	}

	function initFrame(){
		loadFrame(activeFrame, 0);
	}

	function frameHandler(frames, object){
		var frameN = 'frame'+frames;
		var c = {};
		c['frame'] = true;
		if($.isArray(frames)){
			frames.forEach(function(f){
				c['frame'+f] = true;
			});
		} else {
			c['frame'+frames] = true;
		}
		object.classed(c);
		return object;
	}

	this.hide = function(options){

		// defaults
		var fade = 1000,
		delay = 0,
		destroy = false;

		// overwrite defaults if set
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};
		if(options.destroy){destroy = options.destroy};

		if((options.object == undefined)||(options.object == '')){alert("hide: no object has been set - e.g. 'object': pie1"); return false;};
		var object = options.object;

		object
		.transition()
		.delay(delay)
		.duration(fade)
		.style('opacity', 0);	

		if(options.destroy == true){
			object.remove();
		}
	};

	this.show = function(options){

		// defaults
		var fade = 1000,
		delay = 0,
		opacity = 1;

		// overwrite defaults if set
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};
		if(options.opacity){opacity = options.opacity};

		if((options.object == undefined)||(options.object == '')){alert("hide: no object has been set - e.g. 'object': pie1"); return false;};
		var object = options.object;

		object
		.transition()
		.delay(delay)
		.duration(fade)
		.style('opacity', opacity);	
	}

	//*******************************
	// USEFUL FUNCTIONS
	//*******************************
	
	// logger
	this.log = function(element){if(this.logging){console.log(element);}};

	// rounding function
	var rounder = function(value){
		var v = Math.abs(value);

		if(v<100){
			return Math.ceil(value/10)*10;
		};
		if(v<500){
			return Math.ceil(value/50)*50;
		};
		if(v<1000) {
			return Math.ceil(value/100)*100;
		}
		if(v<10000){
			return Math.ceil(value/1000)*1000;
		}
	}

	function addCommas(nStr){
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	function wrap(text, width, str) {

    text.each(function () {
        var text = d3.select(this),
            words = str.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.3, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

	//*********************************
	// CREATE SVG
	//*********************************

	this.createSvg = function(options){

		// defaults
		var width = '100%',
		height = '100%',
		svgClass = 'svg',
		downloadButton = false,
		aspectRatio = 2;

		if((options.div == undefined)||(options.div == '')){alert("createSvg: no div has been set - e.g. 'div': '#box1'"); return false;};
		if((options.id == undefined)||(options.id == '')){alert("createSvg: no id has been set for the svg - e.g. 'id': 'svg1'"); return false;};

		// overwrite defaults if set
		if(options.width){width = options.width};
		if(options.height){height = options.height};
		if(options.id){id = options.id};
		if(options.class){svgClass = options.class};
		if(options.div){div = options.div};
		if(options.aspectRatio){aspectRatio = options.aspectRatio};
		if(options.downloadButton != undefined){downloadButton = options.downloadButton};


		// RESPONSIVE SVG/DIV - SET ASPECTRATIO
		var vx = 1200;
		var vy = vx*aspectRatio;

		var cWidth = $(div).width();
		var cHeight = $(div).height();

		if((cWidth/aspectRatio)>cHeight){
			$(div).width($(div).height()*aspectRatio);
		}

		var w = $(div).width();
		$(div).height(w/aspectRatio);

		window.onresize = function(event) {
			$(div).width('100%');
			$(div).height('100%');

			var cWidth = $(div).width();
			var cHeight = $(div).height();

			if((cWidth/aspectRatio)>cHeight){
				$(div).width($(div).height()*aspectRatio);
			}

			var w = $(div).width();
			$(div).height(w/aspectRatio);
		};


		// append svg to div
		this.svg = d3.select(div)
		.append('svg')
		.attr('id', id)
		.attr('class', svgClass)
		.attr('height', height)
		.attr('width', width)
		.attr('viewBox', "0 0 "+vx+" "+vy)
		.attr('preserveAspectRatio', "xMinYMin slice")

		// .attr('viewbox', '0 0 400 400')
		// .attr('preserveAspectRatio', 'xMinYMin');

		// add frame number class if option is set
		if(options.frame != undefined){
			vector = frameHandler(options.frame, this.svg);
		};

		return this.svg;
	};


	this.svgImport = function(options){

		// defaults
		var source = './images/MyLayer.svg',
		layerId = 'MyLayer',
		opacity = 1,
		fade = 0,
		delay = 0;

		// overwrite defaults if set
		if(options.source){source = options.source};
		if(options.layerId){layerId = options.layerId};
		if(options.opacity){opacity = options.opacity};
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};

		console.log(options);
		
		if((options.appendTo == undefined)||(options.appendTo == '')){alert("svgImport: no appendTo object has been set - e.g. 'appendTo': svg1"); return false;};
		var appendTo = options.appendTo;

		var svgNode = source.getElementById(layerId);

	    appendTo.node().appendChild(svgNode);

	    d3.selectAll('#'+layerId)
	    .attr('transform', 'translate(0,0)scale(0.83)');
		    

	}

	//*********************************
	// BASIC SHAPES
	//*********************************

	this.rect = function(options) {

		// defaults
		var fill = 'green',
		width = 50,
		height = 50,
		strokeWidth = 2,
		strokeColor = 'darkgreen',
		thisClass = 'rectangle',
		opacity = 1,
		fade = 0,
		delay = 0,
		x = 0,
		y = 0;

		// overwrite defaults if set
		if(options.fill){fill = options.fill};
		if(options.width){width = options.width};
		if(options.height){height = options.height};
		if(options.strokeWidth){strokeWidth = options.strokeWidth};
		if(options.strokeColor){strokeColor = options.strokeColor};
		if(options.opacity){opacity = options.opacity};
		if(options.thisClass){thisClass = options.thisClass};
		if(options.x){x = options.x};
		if(options.y){y = options.y};
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};

		if((options.appendTo == undefined)||(options.appendTo == '')){alert("rect: no appendTo object has been set - e.g. 'appendTo': svg1"); return false;};
		var appendTo = options.appendTo;

		var rect = appendTo
		.append('rect')
		.attr('x', x)
		.attr('y', y)
		.attr('width', width)
		.attr('height', height)
		.style('fill', fill)
		.style('stroke', strokeColor)
		.style('stroke-width', strokeWidth)
		.style('opacity', opacity)

		return rect;

	};


	//*********************************
	// TABLE BAR
	//*********************************

	this.tableBar = function(options) {

		var thisClass = 'tablebar',
		id = "tableBar1",
		opacity = 1,
		xOffset = 0,
		yOffset = 0,
		limit = 5,
		fade = 0,
		delay = 0,
		fill = 'green',
		fillOpacity = 1,
		padding = 0,
		height = 300,
		width = 300,
		axisWidth = 50,
		title = 'Title',
		rowSpacing = 5;

		// overwrite defaults if set
		// if(options.width){width = options.width};
		// if(options.height){height = options.height};
		if(options.thisClass){thisClass = options.thisClass};
		if(options.opacity){opacity = options.opacity};
		if(options.xOffset){xOffset = options.xOffset};
		if(options.yOffset){yOffset = options.yOffset};
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};
		if(options.source){data = options.source};
		if(options.innerRadius){innerRadius = options.innerRadius};
		if(options.innerBorder !== undefined){innerBorder = options.innerBorder};
		if(options.enableText !== undefined){enableText = options.enableText};
		if(options.fontSize){fontSize = options.fontSize};
		if(options.padding){padding = options.padding};
		if(options.height){height = options.height};
		if(options.width){width = options.width};
		if(options.title){title = options.title};
		if(options.limit){limit = options.limit};
		if(options.valueField){valueField = options.valueField};
		if(options.nameField){nameField = options.nameField};
		if(options.class){thisClass = options.thisClass};
		if(options.id){id = options.id};
		if(options.fill){fill = options.fill};
		if(options.fillOpacity){fillOpacity = options.fillOpacity};
		if((options.appendTo == undefined)||(options.appendTo == '')){alert("pie: no appendTo object has been set - e.g. 'appendTo': svg1"); return false;};
		var appendTo = options.appendTo;

		data.sort(function(a,b) { return +b.values.total - +a.values.total; })
		var data = data.filter(function(d){ return (d.key !== 'undefined') && (d.key !== 'TBD')})
		var max = d3.max(data, function(d) { var total = d.values.total; return total; });

		var x = d3.scale.linear()
		.range([0, (width-axisWidth)])
		.domain([0, max]);


		var container = appendTo.append('g')
		.attr('id', id)
		.attr('transform', 'translate('+xOffset+','+yOffset+')');

		var rows = container.selectAll('.'+thisClass)
		.data(data.filter(function(d,i){return i<(limit)}))
		.enter()
		.append('g')
		.attr('class', thisClass)
		.attr('transform', function(d,i){
			return 'translate('+0+','+(i*(height/limit)+rowSpacing)+')';
		});

		var color = ['#00669E','#9CBED0'];


		rows.selectAll(".rowBar")
		.data(function(d,i){ return d.values.bars;})
		.enter()
		.append('rect')
		.attr('class', 'rowBar')
		.attr('width', function(d){
			return x(d);
		})
		.style('fill', function(d,i){
			return color[i];
		})
		.style('fill-opacity', fillOpacity)
		.attr('height', ((height/limit)-rowSpacing))
		.attr('y',0)
		.attr("x", function(d,i){
		var v;
			if(i>0){
				v = d3.select(this.parentNode).datum().values.bars[i-1];
			} else {
				v = 0;
			}
			return x(v);
		})
		.style('stroke', '#FFF')
		.style('stroke-opacity', 0.5);


		rows
		.append('text')
		.style('text-anchor', 'end')
		.attr('y',11)
		.attr('x',-5)
		.style('font-size','10px')

		.text(function(d){
			// console.log(d);
			return d[nameField];
		});

		var t1 = rows
		.append('text')
		.attr('y',12)
		.attr('x', function(d){
			return x(d.values.total)+3;
		})
		.style('font-size','11px')
		.attr('fill', function(d,i){ return color[0]})
		.style('font-weight','bold')
		.text(function(d){
			return addCommas(d.values.bars[0]);
		})
		.attr('class', function(d){
			d.bWidth = d3.select(this).node().getBBox().width;
			return 't1';
		});

		t2Divider = rows
		.append('text')
		.attr('y',12)
		.attr('x', function(d){
			return x(d.values.total)+d.bWidth+4;
		})
		.attr('fill', '#B5B5B5')
		.style('font-size','11px')
		.style('font-weight','bold')
		.text(function(d){
			return '|';
		});

		t2 = rows
		.append('text')
		.attr('fill', function(d,i){ return color[1]})
		.attr('y',12)
		.attr('x', function(d){
			return x(d.values.total)+d.bWidth+10;
		})
		.style('font-size','11px')
		.style('font-weight','bold')
		.text(function(d){
			return addCommas(d.values.bars[1]);
		});



		// title

		var bb = container.node().getBBox();

		// container.append('text')
		// .attr('x', bb.x)
		// .attr('y', -7)
		// .style('font-family', "'Open Sans', sans-serif")
		// .style('font-weight', 'bold')
		// .style('font-size', '14px')
		// .text(title);

				// add frame number class if option is set
			if(options.frame != undefined){
				container = frameHandler(options.frame, container);
			};


	}

	//*********************************
	// PIE CHART
	//*********************************

	this.pie = function(options) {

		var thisClass = 'pie',
		id = "pie1",
		opacity = 1,
		x = 0,
		y = 0,
		fade = 0,
		delay = 0,
		data = [5, 3],
		innerRadius = 0.4,
		innerBorder = true,
		enableText = true,
		fontSize = '30px',
		padding = 0,
		height = 300,
		width = 300,
		title = '';

		// overwrite defaults if set
		// if(options.width){width = options.width};
		// if(options.height){height = options.height};
		if(options.thisClass){thisClass = options.thisClass};
		if(options.opacity){opacity = options.opacity};
		if(options.x){x = options.x};
		if(options.y){y = options.y};
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};
		if(options.data){data = options.data};
		if(options.innerRadius){innerRadius = options.innerRadius};
		if(options.innerBorder !== undefined){innerBorder = options.innerBorder};
		if(options.enableText !== undefined){enableText = options.enableText};
		if(options.fontSize){fontSize = options.fontSize};
		if(options.padding){padding = options.padding};
		if(options.height){height = options.height};
		if(options.width){width = options.width};
		if(options.title){title = options.title};
		if(options.colorArray){color = options.colorArray};

		if((options.appendTo == undefined)||(options.appendTo == '')){alert("pie: no appendTo object has been set - e.g. 'appendTo': svg1"); return false;};
		var appendTo = options.appendTo;

		if((options.id == undefined)||(options.id == '')){alert("pie: no id has been set - e.g. 'id': svg1"); return false;};
		var id = options.id; 

		var piedata = data;

		var radius = Math.min((width/2), ($('#'+appendTo.attr('id')).height()/2));

		var radius = radius - padding; 

		var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(radius - (radius * innerRadius));

		var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d; });

		var pieObject = appendTo
		.append("g")
		.attr('id', id)
		.attr("transform", "translate(" + parseInt(x) + "," + parseInt(y) + ")")
		.style('opacity', opacity);

		if(title!==''){
		pieObject.append('text')
		.attr('x', -width/2+15)
		.attr('y', -height/2)
		.style('font-family', "'Open Sans', sans-serif")
		.style('font-weight', 'bold')
		.style('font-size', '16px')
		.text(title);

		pieObject.append('text')
		.attr('id', 'pieTitleSub')
		.attr('x', -width/2+95)
		.attr('y', -height/2-1)
		.style('font-family', "'Open Sans', sans-serif")
		.style('font-weight', 'normal')
		.style('font-size', '13px')
		.text('(Nationwide)');
		}

		var slices = pieObject.selectAll(".arc")
		.data(pie(piedata))
		.enter().append("g")
		.attr("class", "arc");

		var slices = pieObject.selectAll("path")
		.data(pie(piedata))
		.enter().append("path")
		.attr("d", arc)
		// .style('stroke', '#FFF')
		// .style('stroke-width', 1)
		// .style('stroke-opacity', 0.3)
		.style("fill", function(d, i) { return color[i]; })
		.each(function(d) { this._current = d; }); // store the initial values

		if(enableText == true){
			var textContainer = pieObject
			.append('g')

			var text = textContainer
			.append("text")
			.attr('class','piePercent')
			.style('font-size', fontSize)
			.style('font-weight', 'bold')
			.style("text-anchor", "middle")
			.text(function(d) { var percent = (piedata[0]/(piedata[0]+piedata[1]))*100; return Math.round(percent) + '%' })   
			.attr('y', function(){
				return this.getBBox().height/4;
			})
			.style('opacity', 0);

		}  

		if(this.innerRing){
			pieObject.append("circle")
			.attr('r', function(){ return radius - (radius * innerRadius) -2;})
			.attr('cx', 0)
			.attr('cy', 0)
			.style('fill', 'transparent')
			.style('stroke', '#bfbfbf')
			.style('stroke-width', 1)
		}

// 		var timeout = setTimeout(function() {
//   d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
// }, 2000);

slices.update = function(updateOptions){

			// defaults
			var transition = 1000;

			// set variables
			if(updateOptions.transition){transition = updateOptions.transition};

			if((updateOptions.data == undefined)||(updateOptions.data == '')){alert("pie.update: no data has been set - e.g. 'data': [1,2,3]"); return false;};			
			var piedata = updateOptions.data;

			if((updateOptions.id == undefined)||(updateOptions.id == '')){alert("pie.update: no id has been set - e.g. 'id': '#pie1'"); return false;};			
			var id = updateOptions.id;

			var enterAntiClockwise = {
				startAngle: Math.PI * 2,
				endAngle: Math.PI * 2
			};

			var pieTotal = d3.sum(piedata);

			var pieObject = d3.select(id);

			var path = pieObject.selectAll("path")
			.data(pie(piedata));
			
			path.enter().append("path")
			.style("fill", function (d, i) {
				return color[i];
			})
			.attr("d", arc(enterAntiClockwise))
			.each(function (d) {
				this._current = {
					data: d.data,
					value: d.value,
					startAngle: enterAntiClockwise.startAngle,
					endAngle: enterAntiClockwise.endAngle
				};
			});

			path.exit()
			.transition()
			.duration(transition)
			.attrTween('d', arcTweenOut)
			.remove() // now remove the exiting arcs

			path.transition().duration(transition).attrTween("d", arcTween); // redraw the arcs
			
			function arcTween(a) {
				var i = d3.interpolate(this._current, a);
				this._current = i(0);
				return function(t) {
					return arc(i(t));
				};
			}

			function arcTweenOut(a) {
				var i = d3.interpolate(this._current, {startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0});
				this._current = i(0);
				return function (t) {
					return arc(i(t));
				};
			}

			// update text
			pieObject.select('.piePercent')
			.text(function(d) { var percent = (piedata[0]/(piedata[0]+piedata[1]))*100; return Math.round(percent) + '%' }); 

			var slices = pieObject.selectAll("path")
			.on('mouseover', function(d,i){
				var percent = (d.value/pieTotal)*100;
				d3.select('.piePercent')
				.text(Math.round(percent) + '%')
				.transition()
				.duration(250)
				.style('opacity',1);

			})
			.on('mouseout', function(d){
				d3.select('.piePercent')
				.transition()
				.duration(250)
				.style('opacity',0);
			})

			
			return slices;

		};

		// add frame number class if option is set
			if(options.frame != undefined){
				pieObject = frameHandler(options.frame, pieObject);
			};

		return slices;
	};

	//*********************************
	// LINE/AREA CHART
	//*********************************	

	this.lineChart = function(){

		var LineChart = function(){

			// data format
			this.data = [
			{"date": "2011-08-01", "value": 120}, 
			{"date": "2011-08-03", "value": 10},
			{"date": "2011-08-04", "value": 16}, 
			{"date": "2011-08-11", "value": 113},
			{"date": "2011-09-01", "value": 90}, 
			{"date": "2011-09-02", "value": 11},
			{"date": "2011-09-05", "value": 14},
			{"date": "2011-10-05", "value": 134},
			{"date": "2011-11-05", "value": 324}

			];

			// configurable options
			this.color = color[0];
			this.barSpace = 0.43; // percentage
			this.yAxisEnabled = true;
			this.dataLabelsEnabled = true;
			this.yAxisGrid = true;
			this.cumulative = false;
			// this.xAxisFormat = '%d %b %Y';
			this.xAxisFormat = '%b %Y';
			this.spline = false;
			this.area = true;


			this.create = function(el){

				var cumulative = this.cumulative;

				var margin = {top: 38, right: 15, bottom: 25, left: 40};

				if(this.yAxisEnabled == false){
					margin.left = margin.right;
				}

				var width = $('#'+el.attr('id')).width() - margin.left - margin.right;
				var height = $('#'+el.attr('id')).height() - margin.top - margin.bottom;

				var c = this.color;

				var chartdata = this.data;

				var parseDate = d3.time.format("%Y-%m-%d").parse;

				var v = 0;

				chartdata.forEach(function(d) {
					d.date = parseDate(d.date);
					if(cumulative == true){
						v = v+d.value;
				    d.value = v; // cumulative
					} else {
						d.value = +d.value;
					}
				});

				var x = d3.time.scale()
				.range([0, width])
				.domain(d3.extent(chartdata, function(d) { return d.date; }));

				var maxValue = d3.max(chartdata, function(d) { return d.value; });

				var y = d3.scale.linear()
				.range([height, 0])
				.domain([0, rounder(maxValue)]);

				var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.tickSize(3, 0, 0)
				.ticks(d3.time.months, 1)
				.tickFormat(d3.time.format(this.xAxisFormat))
				// .tickPadding(7)

				var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(4)
				.tickPadding(0);

				if(this.area == false){
					var line = d3.svg.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.value); });
				} else {
					var line = d3.svg.area()
					.x(function(d) { return x(d.date); })
					.y0(height)
					.y1(function(d) { return y(d.value); });
				}

				if(this.spline == true){
					line.interpolate("monotone");
				}

				var svg = el
				.append("g")
				.attr('class', 'lineChart')
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				if(this.yAxisEnabled==true){
					svg.append("g")
					.attr("class", "yAxis axis")
					.call(yAxis)
					.append("text")
					.attr('class','axisLabel')
					.attr("transform", "rotate(-90)")
					.attr("y", -36)
					.attr("dy", ".71em")
					.attr("x", ((-height/2)+25))
					.style("text-anchor", "end")
					// .text("Frequency");
				}

				if(this.yAxisGrid == true){
					var yAxisGrid = yAxis
					.tickSize(width, 0)
					.tickFormat("")
					.orient("right");

					svg.append("g")
					.classed('y', true)
					.classed('grid', true)
					.call(yAxisGrid);
				}

				// place label in between month ticks
				var xAxisOffset = (Math.abs(x(new Date('2011-01-01'))-x(new Date('2011-02-01'))))/2;

				svg.append("g")
				.attr("class", "xAxis axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll(".lineChart .tick text")
				.style("text-anchor", "middle")
				.attr("x", xAxisOffset)
				.attr("y", 5);

				var line = svg.append("path")
				.datum(chartdata)
				.attr("class", "line")
				.attr("d", line)
				.style('stroke', color[0])
				.style('stroke-width', '1.5px');

				if(this.area == true){
					line.style('fill', color[0]);
				}

				return svg;

			}

		}
		return new LineChart;
	}

	//*********************************
	// COLUMN CHART
	//*********************************	

	this.columnChart = function(){

		var ColumnChart = function(){

			// data format
			this.data = [
			{"series": "Cats", "value": 120}, 
			{"series": "Dogs", "value": 10},
			{"series": "Giraffes", "value": 16}, 
			{"series": "Ostriches", "value": 113},
			{"series": "Lions", "value": 90}, 
			{"series": "Cheetahs", "value": 11},
			{"series": "Elephants", "value": 14}
			];

			// configurable options
			this.color = ['#00937F']; // if there are more than one color in the array, cycle through for each bar.
			this.barSpace = 0.43; // percentage
			this.yAxisEnabled = true;
			this.dataLabelsEnabled = true;
			this.yAxisGrid = true;

			this.create = function(el){

				var margin = {top: 38, right: 15, bottom: 25, left: 40};

				if(this.yAxisEnabled == false){
					margin.left = margin.right;
				}

				var width = $('#'+el.attr('id')).width() - margin.left - margin.right;
				var height = $('#'+el.attr('id')).height() - margin.top - margin.bottom;

				var color = this.color;

				var chartdata = this.data;

				var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], this.barSpace)
				.domain(chartdata.map(function(d) { return d.series; }));

				var maxValue = d3.max(chartdata, function(d) { return d.value; });

				var y = d3.scale.linear()
				.range([height, 0])
				.domain([0, rounder(maxValue)]);

				var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.tickSize(0)
				.tickPadding(7)

				var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(3)
				.tickPadding(0);

				var svg = el
				.append("g")
				.attr('class', 'columnChart')
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				if(this.yAxisEnabled==true){
					svg.append("g")
					.attr("class", "yAxis axis")
					.call(yAxis)
					.append("text")
					.attr('class','axisLabel')
					.attr("transform", "rotate(-90)")
					.attr("y", -36)
					.attr("dy", ".71em")
					.attr("x", ((-height/2)+25))
					.style("text-anchor", "end")
					// .text("Frequency");
				}

				if(this.yAxisGrid == true){
					var yAxisGrid = yAxis
					.tickSize(width, 0)
					.tickFormat("")
					.orient("right");

					svg.append("g")
					.classed('y', true)
					.classed('grid', true)
					.call(yAxisGrid);
				}

				svg.append("g")
				.attr("class", "xAxis axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

				var bars = svg.selectAll(".bar")
				.data(chartdata)
				.enter()
				.append('g')
				.attr("class", "bar");

				bars
				.append("rect")
				.attr("x", function(d) { return x(d.series); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.value); })
				.attr("height", function(d) { return height - y(d.value); })
				.style('fill', function(d,i){if(color.length > 1){return color[i]} else {return color[0];}})
				.on('mouseover', function(d,i){
					d3.select(this)
					.style('fill', function(d,i){if(color.length > 1){return color[i]} else {return d3.rgb(color[0]).brighter(0.4);}})
				})
				.on('mouseout', function(d,i){
					d3.select(this)
					.style('fill', function(d,i){if(color.length > 1){return color[i]} else {return color[0];}})
				})
				
				if(this.dataLabelsEnabled==true){
					bars
					.append("svg:text")
					.attr('class','dataLabel')
					.attr("x", function(d) { return x(d.series) + (x.rangeBand()/2); })
					.attr("y", function(d) { return y(d.value)-3; })
				.style("text-anchor", "middle") // text-align: right
				.text(function(d){return d.value});
			}

			function type(d) {
				d.value = +d.value;
				return d;
			}

			return svg;

		}

	}
	return new ColumnChart;
}

	//*********************************
	// BUBBLE CHART
	//*********************************	

	this.bubbleChart = function(options) {

		// defaults
		var fill = 'green',
		strokeWidth = 2,
		strokeColor = 'darkgreen',
		thisClass = 'rectangle',
		opacity = 1,
		fade = 0,
		delay = 0,
		xOffset = 0,
		yOffset = 0,
		color = 'darkred';

		// overwrite defaults if set
		if(options.fill){fill = options.fill};
		if(options.width){width = options.width};
		if(options.height){height = options.height};
		if(options.strokeWidth){strokeWidth = options.strokeWidth};
		if(options.strokeColor){strokeColor = options.strokeColor};
		if(options.opacity){opacity = options.opacity};
		if(options.thisClass){thisClass = options.thisClass};
		if(options.xOffset){xOffset = options.xOffset};
		if(options.yOffset){yOffset = options.yOffset};
		if(options.fade){fade = options.fade};
		if(options.delay){delay = options.delay};
		if(options.source){source = options.source};

		if((options.appendTo == undefined)||(options.appendTo == '')){alert("rect: no appendTo object has been set - e.g. 'appendTo': svg1"); return false;};
		var appendTo = options.appendTo;

		// configurable options
		this.barSpace = 0.43; // percentage
		this.yAxisEnabled = true;
		this.dataLabelsEnabled = true;
		this.yAxisGrid = true;

		var margin = {top: 28, right: 25, bottom: 25, left: 35};

		if(this.yAxisEnabled == false){
			margin.left = margin.right;
		}

		// var width = $('#'+appendTo.attr('id')).width() - margin.left - margin.right;
		// var height = $('#'+appendTo.attr('id')).height() - margin.top - margin.bottom;



		var monthNames = [
	        "Jan", "Feb", "Mar",
	        "Apr", "May", "Jun", "Jul",
	        "Aug", "Sep", "Oct",
	        "Nov", "Dec"
	    ];

		var chartdata = options.source.features;

		var x = d3.time.scale()
		.range([0, width])
		.domain(d3.extent(chartdata, function(d) { return d.properties.time; }));

		var start = x.domain()[0];

		start.setDate(start.getDate()-1);
		start.setHours(23);
		start.setMinutes(59);
		start.setSeconds(0);

		x.domain([start, x.domain()[1]])[0];

		var maxValue = d3.max(chartdata, function(d) { return d.properties.mag; });
		var min = d3.min(chartdata, function(d) { return d.properties.mag; });

		var y = d3.scale.linear()
		.range([height, 0])
		.domain([min, Math.ceil(maxValue)]);

		var radiusScale = d3.scale.linear()
		.domain([min, maxValue])
		.range([0, 30]);  

		var opacityScale = d3.scale.sqrt()
		.domain([min, maxValue])
		.range([0.1, 0.5]); 

		var strokeScale = d3.scale.linear()
		.domain([min, maxValue])
		.range([0.1, 3]);  


		var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickSize(0)
		.ticks(4)
		.tickPadding(5)
		.tickFormat(d3.time.format("%d April"));

		var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(4)
		.tickPadding(0);

		var svg = appendTo
		.append("g")
		.attr('class', 'bubbleChart')
		.attr("transform", "translate(" + xOffset + "," + yOffset + ")");

		svg.append('text')
		.attr('x', -30)
		.attr('y', -45)
		.style('font-family', "'Open Sans', sans-serif")
		.style('font-weight', 'bold')
		.style('font-size', '16px')
		.text('Earthquakes and aftershocks');

		svg.append('text')
		.attr('x', -29)
		.attr('y', -25)
		.style('font-family', "Arial")
		.style('font-weight', 'bold')
		.style('font-size', '12px')
		.text('Source:');

		svg.append('text')
		.attr('x', 18)
		.attr('y', -25)
		.style('font-family', "arial")
		.style('font-weight', 'normal')
		.style('font-size', '12px')
		.text('USGS');






		if(this.yAxisEnabled==true){
			svg.append("g")
			.attr("class", "yAxis axis")
			.call(yAxis)
			.append("text")
			.attr('class','axisLabel')
			.attr("transform", "rotate(-90)")
			.attr("y", -28)
			.attr("dy", ".71em")
			.attr("x", ((-height/2)+25))
			.style("text-anchor", "end")
			.style("font-weight", "bold")
			.text("Magnitude");
		}

		if(this.yAxisGrid == true){
			var yAxisGrid = yAxis
			.tickSize(width, 0)
			.tickFormat("")
			.tickPadding(30)

			.orient("right");

			svg.append("g")
			.classed('y', true)
			.classed('grid', true)
			.call(yAxisGrid);
		}


		svg.append("g")
		.attr("class", "xAxis axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

			var xAxisGrid = xAxis
			.tickSize(height, 0)
			.tickFormat("")
			.tickPadding(0)
			.orient("bottom");

			svg.append("g")
			.classed('x', true)
			.classed('xgrid', true)
			.call(xAxisGrid);



		var bubbles = svg.selectAll(".bubble")
		.data(chartdata)
		.enter()
		.append('g')
		.attr("class", "bubble");




		bubbles
		.append("circle")
		.attr("cx", function(d,i){
			var date = new Date(d.properties.time);
			var day = date.getDate();
		    var monthIndex = date.getMonth();
		    var year = date.getFullYear();

		    var dateFormatted = day + ' ' + monthNames[monthIndex] + ' ' + year;

			return x(d.properties.time);
		})
		.attr("cy", function(d){return y(d.properties.mag)})
		.attr("r", function(d){ return radiusScale(d.properties.mag)})
		.style('fill-opacity', function(d){
			return opacityScale(d.properties.mag);
		})
		.style('stroke-opacity', function(d){
			return opacityScale(d.properties.mag);
		})
		.attr('id', function(d){
				return 'chart'+d.id;
		})
		.attr('class', 'chartbubble')
		.style('stroke', '#570809')
		.style('stroke-width', function(d){
			return strokeScale(d.properties.mag);
		})
		.style("fill", color)
		.on('mouseover', function(d,i){
			d3.select(this)
			.style('stroke-opacity', 1);

				var dt = new Date(d.properties.time);
				var t = dt.toTimeString().substring(0, 5);
				var dt = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear() + ' - ' + t;

				d3.select('.mTitle').text('M'+d.properties.mag);
				d3.select('.mSubTitle1').text(dt);
				d3.select('#dM2').style('opacity', 1);


			var thisid = d.id;
			var mapbubbles = d3.selectAll('.mapbubble')
			.style('opacity', function(d){
				if(d.id == thisid){
					return 1
				} else {
					return 0.2;
				}
			})
			.style('stroke-opacity', function(d){
				if(d.id == thisid){
					return 1
				} else {
					return 0.2;
				}
			});
		})
		.on('mouseout', function(d,i){
			var mapbubbles = d3.selectAll('.mapbubble')
			.style('opacity',1)
			// .selectAll('circle')
			.style('stroke-opacity', function(d){
				return opacityScale(d.properties.mag);
			})

			d3.select(this)
			.style('stroke-opacity', function(d){
				return opacityScale(d.properties.mag);
			});
			d3.select('#dM2').style('opacity', 0)
			.attr('transform', 'translate(-100,-100)');

		})
		.on('mousemove', function(d,i){

			var t = d3.transform(d3.select(this).attr("transform")),
		    xt = t.translate[0],
		    yt = t.translate[1];

			coordinates = d3.mouse(this);
			var x = coordinates[0]+xt+xOffset;
			var y = coordinates[1]+yt+yOffset;

			d3.select('#dM2')
			.attr('transform', 'translate('+(x+13)+','+(y+5)+')');


		});

					// add frame number class if option is set
			if(options.frame != undefined){
				svg = frameHandler(options.frame, svg);
			};


		function type(d) {
		d.value = +d.value;
		return d;
		}

		return svg;


}


	//*********************************
	// MAPS - BASIC
	//*********************************	

	this.map = function(options) {

		// defaults
		var center = [44,33],
		mapbox = 'matthewsmawfield.31370f48',
		enableRaster = true,
		enableZoomButtons = true,
		enableZoomMouseScroll = true,
		enablePan = true,
		zoomInit = 14,	
		zoomInSteps = 3,
		zoomOutSteps = 3,
		zoomFactor = 1.5,
		coordinatesTooltip = true,
		coordinatesToClipboard = true,
		enableDownload = false,
		xOffset = 0,
		yOffset = 0;

		// overwrite defaults if set
		if(options.center){center = options.center};
		if(options.xOffset){xOffset = options.xOffset};
		if(options.yOffset){yOffset = options.yOffset};
		if(options.zoomInit){zoomInit = options.zoomInit};
		if(options.mapbox){mapbox = options.mapbox};
		if(options.enableRaster != undefined){enableRaster = options.enableRaster};
		if(options.enablePan != undefined){enablePan = options.enablePan};
		if(options.enableZoomButtons != undefined){enableZoomButtons = options.enableZoomButtons};
		if(options.enableZoomMouseScroll != undefined){enableZoomMouseScroll = options.enableZoomMouseScroll};
		if(options.zoomInSteps){zoomInSteps = options.zoomInSteps};
		if(options.zoomOutSteps){zoomOutSteps = options.zoomOutSteps};
		if(options.zoomFactor){zoomFactor = options.zoomFactor};

		if(options.coordinatesTooltip != undefined){coordinatesTooltip = options.coordinatesTooltip};
		if(options.coordinatesToClipboard != undefined){coordinatesToClipboard = options.coordinatesToClipboard};
		if(options.enableDownload != undefined){enableDownload = options.enableDownload};

// $(div).height();

		var svg = options.appendTo;

		var zoomInitScale = null;


		// set width and height in relation to viewbox
		var vb = svg.attr('viewBox').split(" ");
		var vx = vb[2];
		var vy = vb[3];

		var width = vx;
		var hr = vx/vy;
		var height = vx*hr;


		// create container and mask 
		var map = svg.append('g').attr('id','mapsvgcontainer')
		.attr('mask', 'url(#mask)');




		// description text
		// svg.append("text")
	 //    .attr("x", 10 )
	 //    .attr("y", 65 )
	 //    .style('font-size', '12px')
	 //    .style('font-family', "'Open Sans', sans-serif")
	 //    .call(wrap, 250, 'On 25 April, a 7.8 magnitude earthquake struck Nepal, with the epicenter in Lamjung District (north-west) of Kathmandu. Dozens of aftershocks followed, including a 6.7 magnitude earthquake on 26 April.'); // wrap the text in <= 30 pixels



		// raster
		if(enableRaster == true){
			var tile = d3.geo.tile()
			.size([width, height]);
		};

		// define projection
		var projection = d3.geo.mercator()
		.scale((1 << zoomInit) / 2 / Math.PI *0.98)
		.translate([0,0]);

		// define center point on load
		var centerP = projection([center[0], center[1]]);

		// define path
		var path = d3.geo.path()
		.projection(projection);

		// create layers
		var rasterLayer = map.append("g").attr('id','raster');
		var vectorLayer = map.append("g").attr('id','vector');
		var maskLayer = map.append("g").attr('id','maskLayer');
		var customLayer = svg.append("g").attr('id','customLayer');


		// create an anchor point - fixed center
		var anchorPoint = [
		{lat: center[1], lon: center[0]},
		];

		var centerAnchor = customLayer.selectAll('#centerAnchor')
		.data(anchorPoint)
		.enter()
		.append('g')
		.attr('id', 'centerAnchor')
		.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; })
		.style('opacity', 0);

		centerAnchor
		.append("circle")
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', 5)
		.attr('id', 'anchor')
		.style('fill-opacity', 0)
		.style('stroke-opacity', 0)
		.style('stroke', 'blue');

		// create zoom behavior - by default zoom on center point
		var zoom = d3.behavior.zoom()
		.scale(projection.scale() * 2 * Math.PI)
		.translate([(width/2 - centerP[0]+xOffset), (height/2 - centerP[1]+yOffset)])
		.on("zoom", zoomed);

		var zoomTweak = 0.94;
		var zs = zoom.scale();
		var t = zoom.translate();
		var c = [width / 2, height / 2];
		zoom
		.scale(zs*zoomTweak)
		.translate(
		[c[0] + (t[0] - c[0]) / zs * zs*zoomTweak,
		c[1] + (t[1] - c[1]) / zs * zs*zoomTweak
		]);

		// initiate zoom
		map.call(zoom);
		var translateInit = zoom.translate();
		var scaleInit = zoom.scale();
		zoomed();

		// create coordinates tooltip hover
		var tooltipId = svg.attr('id')+'coordinatesTooltip';

		map
		.on('mousemove', function(){
			if(coordinatesTooltip == true){
				var coords = projection.invert(d3.mouse(this));
				$('#'+tooltipId+' #lon').text(coords[0].toFixed(6));
				$('#'+tooltipId+' #lat').text(coords[1].toFixed(6));
			}
		})
		.on('dblclick', function(){
			if(coordinatesToClipboard==true){
				var coords = projection.invert(d3.mouse(this));
				var str = "{name: 'name', lat: "+coords[1].toFixed(6) + ", lon: "+ coords[0].toFixed(6) + "},";
				window.prompt("Copy to clipboard: Ctrl+C, Enter", str);
			}
		})

		// show a tooltip showing the coordinates on hover
		if(coordinatesTooltip == true){
			var div = $(map[0]).parent('svg').parent('div');
			var svg = $(map[0]).parent('svg');

			var mapClasses = svg.attr('class');

			var c = $(div).append('<div id="'+tooltipId+'" class="coordinatesTooltip '+mapClasses+'"><i class="fa fa-crosshairs"></i>&nbsp;Latitude: <span id="lat">34.123</span> | Longitude: <span id="lon">43.12</span></div>');
		}

		// zoom/translate fuction
		function zoomed(){


			projection
			.scale(zoom.scale() / 2 / Math.PI)
			.translate(zoom.translate());


			// vector polygons
			vectorLayer.selectAll('.geopoly path')
			.attr("d", path);

			// vector layer
			vectorLayer.selectAll('.vector')
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });


			// var translateZoom = projection([0,0]);
			// var translateNew = [translateZoom[0]-translateInit[0], translateZoom[1]-translateInit[1]];
			
			// move center reference anchor (used when importing svg layers)
			centerAnchor
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			if(d3.selectAll('#centerAnchor').node()){

				// make the center anchor visible for reference
				// centerAnchor.style('opacity', 1);

				// get centor anchor offset
				var centerAnchorTranslate = d3.transform(centerAnchor.attr("transform")).translate;

					// make the import anchor visible for reference
					d3.selectAll('.import').each(function(d) {

						var anchor = d3.select(this).select('#anchor');

						// anchor.style('opacity', 1);

						if(anchor.node()){

							// get import anchor bounding box
							var importAnchor = anchor.node().getBBox();

							// get x/y offset to translate the import layer
							var xOffset = centerAnchorTranslate[0] - (importAnchor.x+(importAnchor.width/2));
							var yOffset = centerAnchorTranslate[1] - (importAnchor.y+(importAnchor.height/2));

							// translate the import layer
							d3.select(this).attr('transform', 'translate('+xOffset+','+yOffset+')');
						}
					});
			};

			// symbol points
			vectorLayer.selectAll('.symbolPoint')
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			// text labels
			vectorLayer.selectAll('.textLabel')
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			vectorLayer.selectAll('.districtLabels')
			.attr("transform", function(d) { return "translate(" + projection([d.centroid_x,d.centroid_y]) + ")"; });

			// styled labels
			vectorLayer.selectAll('.styledLabel')
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			// arrows
			var arrowFn = d3.svg.line()
			.x(function (d) {
				e = projection([d.lon, d.lat]);
				return e[0];
			})
			.y(function (d) {
				e = projection([d.lon, d.lat]);
				return e[1];
			})
			.interpolate('basis');

			var arrows = vectorLayer.selectAll('.arrow').attr('d', arrowFn);


			// raster tiles
			if(enableRaster == true){

				var i = 1;
				var tiles = tile
				.scale(zoom.scale())
				.translate(zoom.translate())();

				var image = rasterLayer
				.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
				.selectAll("image")
				.data(tiles, function(d) { return d; });

				image.exit()
				.remove();

				image.enter().append("image")
				.attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/"+mapbox+"/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })				
				.attr("width", 1)
				.attr("height", 1)
				.style("opacity", 1)
				.attr("class", "imgtile")
				.attr("x", function(d) { return d[0]; })
				.attr("y", function(d) { return d[1]; });
			}

		} // end of zoomed() 

		// disable zoom with mouse wheel
		if(enableZoomMouseScroll == false){
			map
			.on("mousewheel.zoom", null)
			.on("dblclick.zoom", null)
			.on("DOMMouseScroll.zoom", null) // disables older versions of Firefox
			.on("wheel.zoom", null) // disables newer versions of Firefox
		}

		// disable pan
		if(enablePan == false){
			map
			.on("mousedown.zoom", null)
			.on("touchstart.zoom", null)
			.on("touchmove.zoom", null)
			.on("touchend.zoom", null);
		}

		// zoom buttons
		if(enableZoomButtons == true){

			var div = $(map[0]).parent('svg').parent('div');
			var svg = $(map[0]).parent('svg');
			var mapClasses = svg.attr('class');
			var divId = div.attr('id');
			var zoomId = svg.attr('id')+'zoomBox';
			var zoomButtonsHtml = '<div id="'+zoomId+'" class="zoomBox"><div class="zoom zoomIn"></div><div class="zoom zoomOut"></div></div>';

			var zoomDiv = $('#'+divId)
			.append(zoomButtonsHtml);

			// zoom in
			$('#'+zoomId+ ' .zoomIn').on('click', function(){

				if(zoom.scale()<((1 << zoomInit)*(Math.pow(zoomFactor, zoomInSteps)))){
					var scale = zoom.scale();
					var extent = zoom.scaleExtent();
					var newScale = scale * zoomFactor;
					//  if (extent[0] <= newScale && newScale <= extent[1]) {
					var t = zoom.translate();
					var c = [width / 2, height / 2];
					zoom
					.scale(newScale)
					.translate(
						[c[0] + (t[0] - c[0]) / scale * newScale,
						c[1] + (t[1] - c[1]) / scale * newScale
						]);

					zoomed();

					if(zoom.scale()<((1 << zoomInit)*(Math.pow(zoomFactor, zoomInSteps)))){
						$('#'+div.attr('id') + ' .zoomIn').removeClass('disabled');
						$('#'+div.attr('id') + ' .zoomOut').removeClass('disabled');
					} else {
						$('#'+div.attr('id') + ' .zoomIn').addClass('disabled');
						$('#'+div.attr('id') + ' .zoomOut').removeClass('disabled');
					}
				}
			});

			$('#'+zoomId+ ' .zoomOut').on('click', function(){

				if(zoom.scale()>((1 << zoomInit)/(Math.pow(zoomFactor, zoomOutSteps)))){

					var scale = zoom.scale();
					var extent = zoom.scaleExtent();
					var newScale = scale / zoomFactor;
					//  if (extent[0] <= newScale && newScale <= extent[1]) {
					var t = zoom.translate();
					var c = [width / 2, height / 2];
					zoom
					.scale(newScale)
					.translate(
						[c[0] + (t[0] - c[0]) / scale * newScale,
						c[1] + (t[1] - c[1]) / scale * newScale
						]);

					zoomed();

					if(zoom.scale()>((1 << zoomInit)/(Math.pow(zoomFactor, zoomOutSteps)))){
						$('#'+div.attr('id') + ' .zoomIn').removeClass('disabled');
						$('#'+div.attr('id') + ' .zoomOut').removeClass('disabled');
					} else {
						$('#'+div.attr('id') + ' .zoomIn').removeClass('disabled');
						$('#'+div.attr('id') + ' .zoomOut').addClass('disabled');
					}
				}

			});
		}

		map.downloader = function(){

			var s = $(map[0]).parent('svg').attr('id');

			var div = $(map[0]).parent('svg').parent('div');
			var el = document.getElementById( id );

			d3.select('#'+div.attr('id'))
			.append('a')
			.attr('href', '#')
			.text('download')
			.style({
				'position': 'absolute',
				'top': '20px',
				'left': '10px'
			})
			.attr('download', 'download.svg')
			.on('click', function(){

				// var z = zoom.translate();

				var w = svg.attr('width');
				var h = svg.attr('height');

				svg
				.attr('height', 1000)
				.attr('width', 1000);

				// zoom
				// .translate([0,0]);

				// zoomed();

				// var coordinates = [0,0]
				// map.attr("transform", "translate(" + (-coordinates[0]) + "," + (-coordinates[1]) + ")");

				var serializer = new XMLSerializer();
				var s = serializer.serializeToString(el);

				d3.select(this)
				.attr('href', 'data:Application/octet-stream;filename=download.svg,' + encodeURIComponent(s));

				// map
				// .attr('height', height)
				// .attr('width', width);

				// zoom
				// .translate(z);

				// zoomed();

				svg
				.attr('height', h)
				.attr('width', w);


			});
		}

		map.addVectorPolygon = function(options){

			var vector;

			// defaults
			var polygonClass = 'polygon',
			strokeWidth = 2,
			strokeColor = 'blue',
			strokeOpacity = 0.1,
			fill = 'cyan',
			fillOpacity = 1,
			polygonClass = 'polygonPatternFill',
			opacity = 1,
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.strokeWidth){strokeWidth = options.strokeWidth};
			if(options.strokeColor){strokeColor = options.strokeColor};
			if(options.strokeOpacity != undefined){strokeOpacity = options.strokeOpacity};
			if(options.fill){fill = options.fill};
			if(options.fillOpacity != undefined){fillOpacity = options.fillOpacity};
			if(options.opacity){opacity = options.opacity};
			if(options.class){polygonClass = options.class};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};

			// get the first object in the topojson (e.g. un_world)
			var data = topojson.feature(options.source, options.source.objects[Object.keys(options.source.objects)[0]]).features;

			vector = vectorLayer.selectAll('.'+polygonClass)
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'geopoly');

			// add frame number class if option is set
			if(options.frame != undefined){
				vector = frameHandler(options.frame, vector);
			};

			vector = vector 
			.append("path")
			.attr("class", polygonClass)
			.attr("d", path)
			.attr("id", function(d) {return d.id;})
			.style('fill', function(d){return fill;})
			.style('fill-opacity', fillOpacity)
			.style('stroke', strokeColor)
			.style('stroke-width', strokeWidth)
			.style('stroke-opacity', strokeOpacity)

			.on("mouseover", function(d) {

			})
			.on("mouseout", function(d) {

			});

			return vector;

		};

		map.addVectorPolygonPatternFill = function(options){

			// defaults
			var lineSpace = 1,
			strokeWidth = 2,
			strokeColor = 'blue',
			polygonClass = 'polygonPatternFill',
			opacity = 1,
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.lineSpace){lineSpace = options.lineSpace};
			if(options.strokeWidth){strokeWidth = options.strokeWidth};
			if(options.strokeColor){strokeColor = options.strokeColor};
			if(options.opacity){opacity = options.opacity};
			if(options.class){polygonClass = options.class};
			if(options.source){source = options.source};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};

			// get the first object in the topojson (e.g. un_world)
			var data = topojson.feature(options.source, options.source.objects[Object.keys(options.source.objects)[0]]).features;

			// define the fill pattern

			patternId = patternId + 1;

			var def = map
			.append("defs")
			.append('pattern')
			.attr('id', 'pattern'+patternId)
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 4+lineSpace)
			.attr('height', 4+lineSpace)
			.append('path')
			.attr('d', 'M-1,1 l'+(2+lineSpace)+',-'+(2+lineSpace)+' M0,'+(4+lineSpace)+' l'+(4+lineSpace)+',-'+(4+lineSpace)+' M'+(3+lineSpace)+','+(5+lineSpace)+' l'+(2+lineSpace)+',-'+(2+lineSpace)+'')
			.style('stroke', strokeColor)
			.style('stroke-width', strokeWidth);

			var vector = vectorLayer.selectAll('.'+polygonClass)
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'geopoly')
			.style('opacity', 1);

			var vectorShape = vector
			.append("path")
			.attr("class", polygonClass)
			.attr("d", path)
			.attr("id", function(d) {return d.id;})
			.style('fill', "url(#pattern"+patternId+")")
			.style('opacity', 0)
			// .style('fill-opacity', 0.4)
			// .style('stroke', '#bdbfbe')
			// .style('stroke-width', 1)
			.on("mouseover", function(d) {

			})
			.on("mouseout", function(d) {

			});

			vectorShape
			.transition()
			.delay(delay)
			.duration(fade)
			.style('opacity', opacity);	

			// add frame number class if option is set
			if(options.frame != undefined){
				vector = frameHandler(options.frame, vector);
			};

			return vector;

		};

		map.addVectorPoints = function(options){

			var vector;

			var data = options.source;

			var max = d3.max(data, function(d) { return +d.idps; });

			var radiusScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0, 40]);  

			var fontNameScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0.6, 0.75]);  

			var fontScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0.7, 1.6]);  

			vectorGroup = vectorLayer.selectAll('.'+options.class)
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'vector')
			.style('opacity', 1)
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			var vector = vectorGroup
			.append("circle")
			.attr("class", options.class)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", "2px")
			.style('stroke', 'black')
			.style('stroke-width', 1)
			.style("fill", 'red');

			var textName = vectorGroup
			.append('text')
			.attr('y', -5)		
			.style('text-anchor', 'middle')
			.style('fill', '#575757')
			.style('opacity', 0)
			.style('font-family', "'Open Sans', sans-serif")
			.style('font-size', function(d){ return fontNameScale(d.idps).toFixed(2)+'em'; })
			.style('font-weight', 'normal')
			.text(function(d){return d.name;})
			.transition()
			.duration(2500)
			.delay(1000)
			.style('opacity', 1);


			var textFigure = vectorGroup
			.append('text')
			.style('text-anchor', 'middle')
			.style('fill', '#0a4623')
			.style('fill-opacity', 0)
			.style('font-family', "'Open Sans', sans-serif")
			.style('font-size', function(d){ return fontScale(d.idps).toFixed(2)+'em'; })
			.style('font-weight', 'bold')
			.text(function(d){return addCommas(d.idps);})
			.attr('y', function(){
				var bbox = d3.select(this).node().getBBox();
				return bbox.height/2;
			})
			.transition()
			.duration(2500)
			.delay(1000)
			.style('fill-opacity', 0.7);

			// vizlib.map.zoomed();				

			if(options.frame != undefined){
				vectorGroup = frameHandler(options.frame, vectorGroup);
			};

			return vectorGroup;

		};

		map.addEarthquake = function(options){

			var vector;
			var color = 'darkred';

			var data = options.source.features;
			var size = options.size;
			var max = 9;
			var opacity = 0.3;

			data.sort(function(a,b) { return +b.properties.mag - +a.properties.mag; })

			var max = d3.max(data, function(d) { return d.properties.mag; });
			var min = d3.min(data, function(d) { return d.properties.mag; });

			var radiusScale = d3.scale.linear()
			.domain([min, max])
			.range([0, 30]);  

			var opacityScale = d3.scale.sqrt()
			.domain([min, max])
			.range([0.1, 0.5]); 

			var strokeScale = d3.scale.linear()
			.domain([min, max])
			.range([0.1, 2]);  

			var fontNameScale = d3.scale.sqrt()
			.domain([min, max])
			.range([0.6, 0.85]);  

			var fontScale = d3.scale.linear()
			.domain([min, max])
			.range([0, 2.5]);  

			vectorGroup = vectorLayer.selectAll('.'+options.class)
			.data(data)
			.enter()
			.append('g')
			.attr('class', 'vector')
			.attr("transform", function(d) { return "translate(" + projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]) + ")"; })
			.on('mousemove', function(d,i){

				var t = d3.transform(d3.select(this).attr("transform")),
			    xt = t.translate[0],
			    yt = t.translate[1];

				coordinates = d3.mouse(this);
				var x = coordinates[0]+xt;
				var y = coordinates[1]+yt;

				d3.select('#dM2')
				.attr('transform', 'translate('+(x+13)+','+(y+5)+')');


			})
			.on('mouseout', function(d,i){
				d3.select('#dM2')
				.attr('transform', 'translate(-100,-100)');

			})


			vectorGroup
			.append("circle")
			.attr("class", options.class)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", function(d){ return radiusScale(d.properties.mag)})
			.style('fill-opacity', function(d){
				return opacityScale(d.properties.mag);
			})
			.style('stroke-opacity', function(d){
				return opacityScale(d.properties.mag);
			})
			.attr('id', function(d){
				return 'map'+d.id;
			})
			.attr('class', 'mapbubble')
			.style('stroke', '#570809')
			.style('stroke-width', function(d){
				return strokeScale(d.properties.mag);
			})
			.style("fill", color)
			.on('mouseover', function(d,i){

				var dt = new Date(d.properties.time);
				var t = dt.toTimeString().substring(0, 5);
				var dt = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear() + ' - ' + t;

				d3.select('.mTitle').text('M'+d.properties.mag);
				d3.select('.mSubTitle1').text(dt);
				d3.select('#dM2').style('opacity', 1);

				d3.select(this)
				.style('stroke-opacity', 1);

				var thisid = d.id;
				var mapbubbles = d3.selectAll('.chartbubble')
				.style('opacity', function(d){
					if(d.id == thisid){
						return 1
					} else {
						return 0.2
					}
				})
				.style('stroke-opacity', function(d){
					if(d.id == thisid){
						return 1
					} else {
						return 0.2
					}
				});
		})
		.on('mouseout', function(d,i){

			d3.select('#dM2').style('opacity', 0);
			var mapbubbles = d3.selectAll('.chartbubble')
			.style('opacity',1)
			.style('stroke-opacity', function(d){
				return opacityScale(d.properties.mag);
			})

			d3.select(this)
			.style('stroke-opacity', function(d){
				return opacityScale(d.properties.mag);
			})

		})


			if(options.frame != undefined){
				vectorGroup = frameHandler(options.frame, vectorGroup);
			};

			return vectorGroup;

		};

		map.addProportionalCircles = function(options){

			// defaults
			var source = [{'name': 'zero', 'lat': 0, 'lon': 0}],
			dataVariable = 'idps',
			circleClass = 'idps',
			opacity = 1,
			circleOpacity = 0.2,
			fade = 0,
			delay = 0,
			color = '#0a4a25',
			showTextLabel = true,
			textVariable = 'name';

			// overwrite defaults if set
			if(options.source){source = options.source};
			if(options.dataVariable){dataVariable = options.dataVariable};
			if(options.circleClass){circleClass = options.circleClass};
			if(options.opacity){opacity = options.opacity};
			if(options.circleOpacity){circleOpacity = options.circleOpacity};
			if(options.color){color = options.color};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};
			if(options.showTextLabel != undefined){showTextLabel = options.showTextLabel};
			if(options.textVariable){textVariable = options.textVariable};

			var vector;
			var data = options.source;
			var max = d3.max(data, function(d) { return +d[dataVariable]; });

			var radiusScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0, 40]);  

			var fontNameScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0.6, 0.75]);  

			var fontScale = d3.scale.sqrt()
			.domain([0, max])
			.range([0.7, 1.6]);  

			vectorGroup = vectorLayer.selectAll('.'+options.class)
			.data(data)
			.enter()
			.append('g')
			.classed({
				'vector': true
			})
			.style('opacity', opacity)
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			var vector = vectorGroup
			.append("circle")
			.attr("class", options.class)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 0)
			.style('stroke', color)
			.style('stroke-width', 1)
			.style('stroke-opacity', 1)
			.style("fill", color)
			.style("fill-opacity", 0.5)
			.style('opacity', 0);

			vector.transition().duration(fade).delay(delay/2)
			.attr('r', function(d,i){ return radiusScale(d[dataVariable]);})
			.style('opacity', circleOpacity);

			if(showTextLabel == true){

				var textName = vectorGroup
				.append('text')
				.attr('class', 'textName')		
				.attr('y', -5)		
				.style('text-anchor', 'middle')
				.style('fill', color)
				.style('opacity', 0)
				.style('font-family', "'Open Sans', sans-serif")
				.style('font-size', function(d){ return fontNameScale(d[dataVariable]).toFixed(2)+'em'; })
				.style('font-weight', 'normal')
				.text(function(d){ return d[textVariable];})
				.transition()
				.duration(fade)
				.delay(delay)
				.style('opacity', 1);


				var textFigure = vectorGroup
				.append('text')
				.attr('class', 'textFigure')		
				.style('text-anchor', 'middle')
				.style('fill', color)
				.style('fill-opacity', 0)
				.style('font-family', "'Open Sans', sans-serif")
				.style('font-size', function(d){ return fontScale(d[dataVariable]).toFixed(2)+'em'; })
				.style('font-weight', 'bold')
				.text(function(d){return addCommas(d[dataVariable]);})
				.attr('y', function(){
					var bbox = d3.select(this).node().getBBox();
					return bbox.height/2;
				})
				.transition()
				.duration(fade)
				.delay(delay)
				.style('fill-opacity', 0.7);
			}

			// vizlib.map.zoomed();				

			vectorGroup.update = function(updateOptions){
				var dataVariable = updateOptions.dataVariable;
				var duration = updateOptions.duration;
				var color = updateOptions.color;

				this.selectAll('circle')
				.transition()
				.duration(duration)
				.style('fill', color)
				.style('stroke', color)
				.attr('r', function(d,i){ return radiusScale(d[dataVariable]);});

				this.selectAll('.textName')
				.transition()
				.duration(duration)
				.style('font-size', function(d){ return fontNameScale(d[dataVariable]).toFixed(2)+'em'; })
				.text(function(d){ return d[textVariable];});


				this.selectAll('.textFigure')
				.transition()
				.duration(duration)
				.style('fill', color)
				.style('font-size', function(d){ return fontScale(d[dataVariable]).toFixed(2)+'em'; })
				.attr('y', function(d){
					return fontScale(d[dataVariable])*6+3;
				})
				.tween("text", function(d) {
					var i = d3.interpolate(this.textContent.replace(/\,/g,''), d[dataVariable]),
					prec = (d[dataVariable] + "").split("."),
					round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

					return function(t) {
						this.textContent = addCommas(Math.round(i(t) * round) / round);
					};
				});
			};

			if(options.frame != undefined){
				vectorGroup = frameHandler(options.frame, vectorGroup);
			};

			return vectorGroup;

		};

		map.addSymbolPoints = function(options){

			// defaults
			var fontSize = 12,
			fontWeight = 'normal',
			fontColor = '#000',
			fontFamily = "'Open Sans', sans-serif",
			fontStyle = 'normal',
			opacity = 1,
			symbolClass = 'symbol',
			width = 12,
			height = 12,
			icon = './images/mapicons/Admin1Capital.svg',
			xOffset = 0,
			yOffset = 0,
			source = [{name: 'Zero1', lat: 2, lon: 0}],
			fade = 0,
			delay = 0,
			frame = 0,
			orientation = 'right';

			// options which can't be overwritten by the template (still defind as options)
			if(options.frame != undefined){var frame = options.frame};
			if(options.source){source = options.source};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};
			if(options.class){symbolClass = options.class};
			if(options.orientation){orientation = options.orientation};

			if(options.hasOwnProperty('template')) {
				options = symbolTemplate[options.template];
			};

			// overwrite defaults if set
			if(options.fontSize){fontSize = options.fontSize};
			if(options.fontWeight){fontWeight = options.fontWeight};
			if(options.fontFamily){fontFamily = options.fontFamily};
			if(options.fontStyle){fontStyle = options.fontStyle};
			if(options.icon){icon = options.icon};
			if(options.opacity){opacity = options.opacity};
			if(options.fontColor){fontColor = options.fontColor};
			if(options.textAnchor){textAnchor = options.textAnchor};
			if(options.width){width = options.width};
			if(options.height){height = options.height};
			if(options.xOffset){xOffset = options.xOffset};
			if(options.yOffset){yOffset = options.yOffset};
			

			

			var vector = vectorLayer;

			var svg = vectorLayer;		

			var symbol = svg.selectAll('.symbolPoint .'+symbolClass)
			.data(source)
			.enter()
			.append('g')
			.style('opacity',1)
			.attr('class','symbolPoint '+symbolClass)
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			var text = symbol.append('text')
			.text(function(d){return d.name;})
			.style('font-family', fontFamily)
			.style('font-style', fontStyle)
			.style('fill', fontColor)
			.style('font-size', fontSize)
			.style('font-weight', fontWeight)
			.attr('y', 4);

			if(orientation == 'right'){
				text
				.attr('x', 8)
			};

			if(orientation == 'left'){
				text
				.attr('x', function(){
					return -this.getBBox().width-7;
				});
			}

			symbol
			.append("svg:image")
			.attr("xlink:href", icon)
			.attr("width", width)
			.attr("height", height)
			.attr("x", -(height/2)-xOffset)
			.attr("y", -(width/2)-yOffset)
			.append('text')
			.text(function(d){return d.name;});

			symbol
			.transition()
			.delay(delay)
			.duration(fade)
			.style('opacity', opacity);	

			// add frame number class if option is set
			if(frame != 0){
				symbol = frameHandler(frame, symbol);
			};	

			return symbol;

		};

		map.addStyledLabels = function(options){

			// defaults
			var color = '#000',
			opacity = 1,
			labelClass = 'styledLabel1',
			size = 25,
			labelSource = './images/labels/label1.svg',
			xOffset = 0,
			yOffset = 0,
			source = [{name: 'Zero1', lat: 2, lon: 0}],
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.source){source = options.source};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};
			if(options.class){symbolClass = options.class};
			if(options.fontStyle){fontStyle = options.fontStyle};
			if(options.labelSource){labelSource = options.labelSource};
			if(options.opacity){opacity = options.opacity};
			if(options.color){color = options.color};
			if(options.textAnchor){textAnchor = options.textAnchor};
			if(options.size){size = options.size};
			if(options.xOffset){xOffset = options.xOffset};
			if(options.yOffset){yOffset = options.yOffset};

			var vector = vectorLayer;
			var styledLabel;
			//Import the SVG

			d3.xml(labelSource, "image/svg+xml", function(xml) {
				var importedNode = document.importNode(xml.documentElement, true);

				styledLabel = map.selectAll(".styledLabel")
				.data(source)
				.enter()
				.append("g")
				.style('opacity',1)
			    // .attr('width', width)
			    // .attr('height', 3)
			    .attr('class','styledLabel '+labelClass)
			    .attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; })
			    .each(function(d, i){ 

			    	var labelText = d.name;
			    	var label = this.appendChild(importedNode.cloneNode(true)); 
			    	var label = d3.select(label);

			    	var text = label
			    	.attr('height', size)
			    	.select('text');

			    	var wt = 0;
			        // set the text 
			        var textSpan = text
			        .select('tspan')
			        .text(labelText);

			        var t = d3.select('body')
			        .append('svg');

			        var tt = t
			        .append('text')
			        .text(labelText)
			        .style('font-size', function(){
			        	return text.style('font-size');
			        });

			        var bbox = t.node().getBBox();

			        t.remove();
			        tt.remove();

			        // adjust width to fit text
			        label
			        .style('opacity', 0)
			        .select('rect')
			        .attr('width', (parseInt(bbox.width)+27))
			        .style('fill', color);

			        label
			        .select('path')
			        .style('fill', color);

			        label
			        .attr('width', (parseInt(bbox.width)+66));

			        label
			        .attr('preserveAspectRatio', 'xMinYMin')
			        .attr('y', -(size/2))

			        label
			        .transition()
			        .delay(delay)
			        .duration(fade)
			        .style('opacity', opacity);	

			    }); 

				if(options.frame != undefined){
					styledLabel = frameHandler(options.frame, styledLabel);
				};

				initFrame();
			});
		};

		map.addCustomLabels = function(data){

			var textLabels = vectorLayer.selectAll('.labelPoint .districtLabels')
			.data(data.filter(function(d){ return d.key !== 'undefined'}))
			.enter()
			.append('g')
			.style('opacity',0.8)
			.attr('class','districtLabels frame frame1')
			.attr("transform", function(d) { return "translate(" + projection([d.centroid_x,d.centroid_y]) + ")"; });

			textLabels.append('text')
			.text(function(d){return d.name;})
			.attr('x', 0)
			.attr('y', -1)
			.style('font-family', "'Open Sans', sans-serif")
			.style('font-size', 8)
			.style('font-weight', 'bold')
			.style('font-style', 'normal')
			.style('fill', '#000')
			.style('fill-opacity', 0.8)
			.style('text-anchor', 'middle')
			.style('letter-spacing', 0.6)
			.style('paint-order', 'stroke')
			.style('stroke-linecap', 'butt')
			.style('stroke-linejoin', 'miter')
			.style('stroke', '#fff')
			.style('stroke-opacity', 0.5)
			.style('stroke-width', 1);

			textLabels.append('text')
			.text(function(d){return addCommas(d.values.total);})
			.attr('x', 0)
			.attr('y', 11)
			.style('font-family', "'Open Sans', sans-serif")
			.style('font-size', 11)
			.style('font-weight', 'bold')
			.style('font-style', 'normal')
			.style('fill', '#003857')
			.style('text-anchor', 'middle')
			.style('letter-spacing', 0.6)
			.style('paint-order', 'stroke')
			.style('stroke-linecap', 'butt')
			.style('stroke-linejoin', 'miter')
			.style('stroke', '#fff')
			.style('stroke-opacity', 0.5)
			.style('stroke-width', 1);


		};

		map.addTextLabels = function(options){

			// defaults
			var fontSize = 12,
			fontWeight = 'normal',
			fontColor = '#000',
			fontFamily = "'Open Sans', sans-serif",
			fontStyle = 'normal',
			opacity = 1,
			textAnchor = 'middle',
			labelClass = 'label',
			xOffset = 8,
			yOffset = 4,
			source = [{name: 'Zero', lat: 0, lon: 0}],
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.fontSize){fontSize = options.fontSize};
			if(options.fontWeight){fontWeight = options.fontWeight};
			if(options.fontFamily){fontFamily = options.fontFamily};
			if(options.fontStyle){fontStyle = options.fontStyle};
			if(options.opacity){opacity = options.opacity};
			if(options.fontColor){fontColor = options.fontColor};
			if(options.textAnchor){textAnchor = options.textAnchor};
			if(options.class){labelClass = options.class};
			if(options.xOffset){xOffset = options.xOffset};
			if(options.yOffset){yOffset = options.yOffset};
			if(options.source){source = options.source};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};

			var vector = vectorLayer;

			var svg = vectorLayer;		
			
			var textLabels = svg.selectAll('.labelPoint .'+labelClass)
			.data(source)
			.enter()
			.append('g')
			.style('opacity',1)
			.attr('class','textLabel '+ labelClass)
			.attr("transform", function(d) { return "translate(" + projection([d.lon,d.lat]) + ")"; });

			textLabels.append('text')
			.text(function(d){return d.name;})
			.attr('x', xOffset)
			.attr('y', yOffset)
			.style('font-family', fontFamily)
			.style('font-size', fontSize)
			.style('font-weight', fontWeight)
			.style('font-style', fontStyle)
			.style('fill', fontColor)
			.style('text-anchor', textAnchor)
			.style('letter-spacing', 0.6);

			textLabels
			.transition()
			.delay(delay)
			.duration(fade)
			.style('opacity', opacity);		

			// add frame number class if option is set
			if(options.frame != undefined){
				textLabels = frameHandler(options.frame, textLabels);
			};

			return textLabels;

		};

		map.zoomToBounds = function(bounds){

			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = .9 / Math.max(dx / width, dy / height),
			translate = [width / 2 - scale * x, height / 2 - scale * y];

			zoomed();

			// not working - translate and transform??

		};

		map.addMask = function(options){

			// var maskPath = [
			// {name: 'name', lat: 3.024, lon: 3.022},
			// {name: 'name', lat: 5.916, lon: 1.505},
			// {name: 'name', lat: 10.006, lon: 1.132},
			// {name: 'name', lat: 15.532, lon: 2.890},
			// {name: 'name', lat: 16.714, lon: 6.493},
			// {name: 'name', lat: 16.187, lon: 16.161},
			// {name: 'name', lat: 2.673, lon: 14.733},
			// {name: 'name', lat: 1.773, lon: 8.207},
			// ];

			// defaults
			var outline = false;
			var maskClass = 'mask';

			// overwrite defaults if set
			if(options.outline){outline = options.outline};
			if(options.class){maskClass = options.class};
			if(options.path){maskPath = options.path};

			var lineFn = d3.svg.line()
			.x(function (d) {
				e = projection([d.lon, d.lat]);
				return e[0];
			})
			.y(function (d) {
				e = projection([d.lon, d.lat]);
				return e[1];
			})
			.interpolate('cardinal-closed');

			var svgFiltersTmp = $('body').append('<span id="svgFiltersTmp"></span>');

			$('#svgFiltersTmp').load('./images/filters.svg', null, function() { 
				
				var svgFilters = $('#svgFiltersTmp svg defs');
				
				$(svg).append(svgFilters);

				var maskOutline = maskLayer
				.append('g')
				.attr('class', maskClass)
				.attr('fill-rule', 'evenodd')
				.attr('x', 0)
				.attr('y', 0)
				.attr('transform', function(d){
		        	// ENLARGE THE MASK AROUND THE CENTER
					// return 'scale(1.3), translate(-100,-50)';
				});

				var maskOutline = maskOutline
				.selectAll('#maskOutline')
				.data([maskPath])
				.enter()
				.append('path')
				.attr('id', 'maskOutline')
				.attr('d', function(d){return lineFn(d);})
				.style("stroke", 'black')
				.style('fill-opacity', 0)
				.style('fill', 'white')

				if(outline==false){
					maskOutline
					.style('fill-opacity', 1)
					.style('stroke', '#FFF')
					.style('filter','url(#blur111)');
				};

				var p = maskOutline.attr('d');

				p = "M-500,-500 L2000,0 L2000,2000 L0,2000 L-500,-500 Z " + p + " Z ";
				maskOutline.attr('d', p);

				// add frame number class if option is set
				if(options.frame != undefined){
					maskOutline = frameHandler(options.frame, maskOutline);
				};

			});
		};


		map.addLine = function(points){

			var arrow = vectorLayer.append("path")
			.datum({type: "LineString", coordinates: [points[0], points[1]]})
			.attr("class", "route")
			.attr("d", path)
			.style('stroke', 'red')
			.style('stroke-width', 2);

			return arrow;

		}


		map.addArrow = function(options){

			// defaults
			var color = '#FFF',
			strokeWidth = 2,
			source = [
			{"lat": 44.42, "lon": 33.32},
			{"lat": 43, "lon": 29},
			{"lat": 43, "lon": 28}
			],
			opacity = 1,
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.color){color = options.color};
			if(options.strokeWidth){strokeWidth = options.strokeWidth};
			if(options.source){source = options.source};
			if(options.opacity){opacity = options.opacity};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};

			arrow = arrow + 1;

			map.append("defs").append("marker")
			.attr("id", "arrowhead"+arrow)
			.attr("refX", 1) /*must be smarter way to calculate shift*/
			.attr("refY", 2)
			.attr("markerWidth", strokeWidth*3)
			.attr("markerHeight", strokeWidth*2)
			.attr("orient", "auto")
			.append("path")
	        .attr("d", "M 0,0 V 4 L6,2 Z") //this is actual shape for arrowhead
	        .style('fill', color);


	        var lineFn = d3.svg.line()
	        .x(function (d) {
	        	e = projection([d.lon, d.lat]);
	        	return e[0];
	        })
	        .y(function (d) {
	        	e = projection([d.lon, d.lat]);
	        	return e[1];
	        })
	        .interpolate('basis');

	        var line = vectorLayer.selectAll('.path').data([source]);
	        line.enter().append('path')
	        line.attr('class', 'arrow')
	        .attr('d', function(d){return lineFn(d);})
	        .style("stroke", color)
	        .style("stroke-width", strokeWidth)
	        .style('opacity', 0)
	        .style('fill', 'none')
	        .attr("marker-end", "url(#arrowhead"+arrow+")")
	        .style('stroke-linecap', 'round');

	        line
	        .transition()
	        .delay(delay)
	        .duration(fade)
	        .style('opacity', opacity);	

	        // add frame number class if option is set
	        if(options.frame != undefined){
	        	line = frameHandler(options.frame, line);
	        };

	        return line;

	    }

	    map.svgImport = function(options){

			// defaults
			var source = './images/MyLayer.svg',
			layerId = 'MyLayer',
			opacity = 1,
			fade = 0,
			delay = 0;

			// overwrite defaults if set
			if(options.source){source = options.source};
			if(options.layerId){layerId = options.layerId};
			if(options.opacity){opacity = options.opacity};
			if(options.fade){fade = options.fade};
			if(options.delay){delay = options.delay};


			d3.xml(source, function(error, extSvg) {

				var s = $(map[0]).parent('svg').attr('id');

				var svgNode = extSvg.getElementById(layerId);
			    // var svgNode = extSvg.getElementsByTagName("svg")[0];

			    vectorLayer.node().appendChild(svgNode);

			    var importSvg = d3.select('#'+layerId)
			    .style('opacity', 0)
			    .attr('class', 'import');


				if(d3.selectAll('#centerAnchor').node()){

					// make the center anchor visible for reference
					// centerAnchor.style('opacity', 0.1);

					// get centor anchor offset
					var centerAnchorTranslate = d3.transform(centerAnchor.attr("transform")).translate;

					// make the import anchor visible for reference
					d3.selectAll('.import').each(function(d) {

						var anchor = d3.select(this).select('#anchor');

						// anchor.style('opacity', 1);

						if(anchor.node()){

							// get import anchor bounding box
							var importAnchor = anchor.node().getBBox();

							// get x/y offset to translate the import layer
							var xOffset = centerAnchorTranslate[0] - (importAnchor.x+(importAnchor.width/2));
							var yOffset = centerAnchorTranslate[1] - (importAnchor.y+(importAnchor.height/2));

							// translate the import layer
							d3.select(this).attr('transform', 'translate('+xOffset+','+yOffset+')');
						}
					});
					

				};

				d3.selectAll('#anchor').style('stroke-opacity', 0);

			
			    // add frame number classes if option is set
			    if(options.frame != undefined){
			    	importSvg = frameHandler(options.frame, importSvg);
			    };

			    importSvg.transition().delay(delay).duration(fade)
			    .style('opacity', opacity);

			    initFrame();

			    // d3.selectAll('#centerAnchor').remove();
			    // d3.selectAll('#anchor').remove();

			});

		}

		map.hexbin = function(options){

			// defaults
			var source = './images/MyLayer.svg',
			layerId = 'hex',
			opacity = 1,
			meshStrokeOpacity = 0.5,
			meshStrokeColor = '#bbbbbb',
			hexStrokeOpacity = 0.5,
			hexStrokeColor = 'red',
			fade = 0,
			delay = 0,
			radius = 15,
			colorRange = ['#F0B800', '#DD0000'],
			max = 'auto';

			// overwrite defaults if set
			if(options.source){source = options.source};
			if(options.layerId){layerId = options.layerId};
			if(options.opacity != undefined){opacity = options.opacity};
			if(options.hexStrokeOpacity != undefined){hexStrokeOpacity = options.hexStrokeOpacity};
			if(options.meshStrokeOpacity != undefined){meshStrokeOpacity = options.meshStrokeOpacity};
			if(options.meshStrokeColor){meshStrokeColor = options.meshStrokeColor};
			if(options.hexStrokeColor){hexStrokeColor = options.hexStrokeColor};
			if(options.fade){fade = options.fade};
			if(options.radius){radius = options.radius};
			if(options.delay){delay = options.delay};
			if(options.colorRange){colorRange = options.colorRange};
			if(options.max){max = options.max};


				var hexbin = d3.hexbin()
				.size([width, height])
				.radius(radius)
				.x(function(d) {return projection([d.lon, d.lat])[0];})
				.y(function(d) {return projection([d.lon, d.lat])[1];});

				var mesh = vectorLayer.append("g")
				.attr('id', layerId+'_mesh')
				.attr("d", path)
				;

				mesh.append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("d", path)
				.attr("class", layerId+"_mesh")
				.attr("width", width)
				.attr("height", height)

				mesh.append("svg:path")
				.attr("clip-path", "url(#clip)")
				.attr("d",hexbin.mesh())
				.style("stroke-width", .5)
				.style("stroke", meshStrokeColor)
				.style("stroke-opacity", meshStrokeOpacity)
				.style("fill", "none");


				// hex the data
			    var hexData = hexbin(source); 


				// color hexagons
				var hex = vectorLayer.append("g")
			    .attr("d", path)
			    .attr('id',layerId);

			    var hexMax = 0; 

				if(max != 'auto'){hexMax = options.max} else {
					$(hexData).each(function(){
				        if(this.length>hexMax){hexMax = this.length;};
				    });	
				};

			    d3.select('#maxIntensity')
			        .text(hexMax);

			    var opac = d3.scale.sqrt()
			        .domain([1, hexMax])
			        .range([0.2, 1]);

    			var hexColor = d3.scale.linear()
					.domain([1, hexMax])
					.range([colorRange[0], colorRange[1]])
					.interpolate(d3.interpolateLab);

			    var hexagons = hex.selectAll(".hexagon")
			    .data(hexData)
			    .enter()
			    .append("path")
			    .attr("class", "hexagon")
			    .attr("d", function(d){return hexbin.hexagon();})
			    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
			        //.style("fill", "#0000FF")
			        .style("fill", function(d) { return hexColor(d.length); })
			        .style("fill-opacity", function(d) { return opac(d.length); })
			        .style("stroke-width", .5)
			        .style("stroke", hexStrokeColor)
			        .style("stroke-opacity", hexStrokeOpacity);

				// zoomed();

				// add frame number classes if option is set
			    if(options.frame != undefined){
			    	hex = frameHandler(options.frame, hex);
			    	mesh = frameHandler(options.frame, mesh);

			    };

				var zoomHex = function(){
					mesh.remove();
					d3.selectAll('#'+layerId).remove();

					mesh = vectorLayer.append("g")
					.attr('id',layerId+'_mesh')
					.attr("d", path)
					;

					mesh.append("clipPath")
					.attr("id", "clip")
					.append("rect")
					.attr("d", path)
					.attr("class", layerId+"_mesh")
					.attr("width", width)
					.attr("height", height)

					mesh.append("svg:path")
					.attr("clip-path", "url(#clip)")
					.attr("d",hexbin.mesh())
					.style("stroke-width", .5)
					.style("stroke", meshStrokeColor)
					.style("stroke-opacity", meshStrokeOpacity)
					.style("fill", "none");


					// hex the data
				    hexData = hexbin(source); 

					// color hexagons
					hex = vectorLayer.append("g")
				    .attr("d", path)
				    .attr('id',layerId);

					hexData = hexbin(source); 

					hexMax = 0; 

					if(max != 'auto'){hexMax = options.max} else {
						$(hexData).each(function(){
					        if(this.length>hexMax){hexMax = this.length;};
					    });	
					};

					hexColor = d3.scale.linear()
					.domain([1, hexMax])
					.range([colorRange[0], colorRange[1]])
					.interpolate(d3.interpolateLab);

					hexagons = hex.selectAll(".hexagon")
				    .data(hexData)
				    .enter()
				    .append("path")
				    .attr("class", "hexagon")
				    .attr("d", function(d){return hexbin.hexagon();})
				    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
				        //.style("fill", "#0000FF")
				        .style("fill", function(d) { return hexColor(d.length); })
				        .style("fill-opacity", function(d) { return opac(d.length); })
				        .style("stroke-width", .5)
				        .style("stroke", hexStrokeColor)
				        .style("stroke-opacity", hexStrokeOpacity);

			    if(options.frame != undefined){
			    	hex = frameHandler(options.frame, hex);
			    	mesh = frameHandler(options.frame, mesh);

			    };

				}

				zoom.on('zoom', function(){

					zoomed();
					if(activeFrame == options.frame){
					zoomHex();
					}
					
				});

				$('#'+zoomId+ ' .zoomIn').on('click', function(){
					zoomHex();
				});

				$('#'+zoomId+ ' .zoomOut').on('click', function(){
					zoomHex();
				});

				// add frame number classes if option is set
			    if(options.frame != undefined){
			    	hex = frameHandler(options.frame, hex);
			    	mesh = frameHandler(options.frame, mesh);

			    };


		}

	return map;
	}

}



var monthNames = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct","Nov", "Dec"];


//**************************
// DEFINE DATA SOURCES
//**************************
var dataSources = [
{'name': 'adm1', 'source': 'scripts/geo/topojson/adm1.json'},
{'name': 'adm3', 'source': 'scripts/geo/topojson/adm3.json'},
{'name': 'adm3points', 'source': 'scripts/geo/data/adm3points.csv'},
{'name': 'adm4', 'source': 'scripts/geo/topojson/adm4.json'},
{'name': 'deaths', 'source': 'scripts/geo/data/deaths.csv'},
{'name': 'world', 'source': 'scripts/geo/topojson/nepalregion2.json'},
// {'name': 'districts', 'source': 'scripts/geo/data/affected_districts.csv'},
// {'name': 'usgs', 'source': 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2015-04-25&endtime=2015-04-29&maxlatitude=31.09&minlongitude=79.438&minlatitude=25.922&maxlongitude=88.689'},
// {'name': 'topline', 'source': 'scripts/geo/data/topline.csv'},
{'name': 'layout', 'source': 'images/layout.svg'},
{'name': 'shelter', 'source': 'scripts/geo/data/unhcr.csv'},
// {'name': 'hira', 'source': 'scripts/geo/data/hira.csv'},
];


//**************************
// CHECK FOR INTERNET EXPLORER
//**************************
var ie = (function(){
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
    while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',all[0]);
    return v > 4 ? v : undef;
}());

if (ie<=9) {
document.getElementById("loaderContent0").style.display = "block";
throw new Error('Visualisation does not support IE7/8/9');
} else {
document.getElementById("loaderContent1").style.display = "block";
};



//**************************
// DATA ARRAYS
//**************************
var sector = ['WASH', 'Livelihood', 'Food security', 'Protection', 'Shelter', 'NFI', 'Health', 'Nutrition', 'Education', 'Communication', 'Humanitarian access'];
var severity = [1,2,3,3,4,5,6];


//**************************
// COLORS
//**************************

var color = ['#00669E','#9CBED0'];
var colorGreyA = ['#EFEFEF','#E9E9E9','#D4D4D4','#B7B7B7','#959595','#7A7A7A'];

//***********************
// INITIALIZE THE LIBRARY
//***********************
var viz = new Vizlib(dataSources, function(data){

	console.log(data);
	
	var mapsvg = viz.createSvg({
		div: "#svgContainer", 
		id:'mapsvg', 
		// width: 1000,
		// height: 700,
		'frame': [1,2,3],
		'aspectRatio': 1.435,
		'downloadButton': false
	});

	//*************************
	// MAP
	//*************************

	var map = viz.map({
		'appendTo': mapsvg, // svg or g d3 object
		'enableRaster': true,
		'center': [86.614935, 27.252992],
		'xOffset': 220, 
		'yOffset': 40, 
		'zoomInit': 16,
		'mapbox': 'matthewsmawfield.31370f48',
		'enableZoomButtons': true,
		'enableZoomMouseScroll': false,
		'enablePan': true,
		'zoomButtonsHtml': '<div class="zoomBox"><div class="zoom zoomIn"></div><div class="zoom zoomOut"></div></div>',
		'zoomInSteps': 1,
		'zoomOutSteps': 0.1,
		'zoomFactor': 1.5,
		'coordinatesTooltip': true,
		'coordinatesToClipboard': false,
		'frame': [1,2,3] // if double clicking anywhere on the map, show a popup with the coordinates
	});


	//**************************
	// LOAD SVG LAYOUT
	//**************************

	console.log(data.layout);

	var layout = viz.svgImport({
    'appendTo': mapsvg,
    'source': data.layout,
    'id': 'layout',
    'layerId': 'Layout',
	});

	d3.select('#mapLegend')
	.attr('class', 'frame frame1 frame2');

//**************************
// replace fonts
//**************************

$('tspan').each(function(){
	var font = $(this).attr('font-family');

	if(font=='OpenSans-Bold'){
	$(this).attr('font-family', "'Open Sans', sans-serif;").css('font-weight', 'bold');
	}
	if(font=='OpenSans-Italic'){
	$(this).attr('font-family', "'Open Sans', sans-serif;").css('font-style', 'italic');
	}
	if(font=='OpenSans'){
	$(this).attr('font-family', "'Open Sans', sans-serif;");
	}

})




	//**************************
	// DATA STRUCTURE
	//**************************

	var itemType = [];
	var dataView = [];
	var dataPipeline = [];
	var partners = [];


	$.each(data.shelter, function(i,d){

		// unique item types to array
		if($.inArray(d.type,itemType) === -1){
			if(d.type.length >1){
				itemType.push(d.type);
			}
		}

		// unique partners to array
		if($.inArray(d.partner,partners) === -1){
			if(d.partner.length >1){
				partners.push(d.partner);
			}
		}

		var pc;
		// add pcode to data from adm3
		$.each(data.adm3.objects.adm3.geometries, function(i,dd){
			if(d.district==dd.properties.name){
				d.pcode = dd.properties.pcode;
				pc = d.pcode;
			}
		});


		var HRPcode = 'NP-'+pc;

		// add pcode to data from adm4
		$.each(data.adm4.objects.adm4.geometries, function(i,dd){
			// console.log(dd.properties);
			// console.log([HRPcode, dd.properties.district_hrcode, d.vdc, dd.properties.name]);
			if((HRPcode==dd.properties.district_hrcode)&&(d.vdc==dd.properties.name)){
				d.vdc_pcode = dd.properties.vdc_pcode;
			}
		});

		// console.log(d);

		var status = d.status.toLowerCase();

		// if((d.items>0)&&(d.startdate.length>1)&&(d.status.toLowerCase().indexOf('completed')>-1)){
		if((d.items>0)&&(d.startdate.length>1)){
			if((status.indexOf("completed") > -1)||(status.indexOf("ongoing") > -1)){
				dataView.push(d);
			};
		}

		if(status.indexOf("pipeline") > -1){
			dataPipeline.push(d);
		}

	});
	
	
	// mapsvg.append("text")
	// .attr("x", 710 )
	// .attr("y", 165 )
	// .style('font-size', '12px')
	// .style('font-family', 'calibry')
	// .call(wrap, 250, 'partners'); // wrap the text in <= 30 pixels

	partners.sort(d3.descending);

	var partnersStr = '';

	$.each(partners, function(i,d){
		partnersStr = d + ', ' + partnersStr;
	});

	d3.select('#partnerText tspan')
	.call(wrap, 480, partnersStr.substring(0, partnersStr.length - 2)); 

	var parseDate = d3.time.format("%d/%m/%y").parse;


	// get dates
	var dataByDate = d3.nest()
    .key(function(d) { return d.startdate; })
    .rollup(function(leaves) { 
    	var sum1 = d3.sum(leaves, function(d){
    		if(d.type==itemType[0]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});
    	var sum2 = d3.sum(leaves, function(d){
    		if(d.type==itemType[1]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});

    	if(isNaN(sum1)){sum1=0};
    	if(isNaN(sum2)){sum2=0};

    	return {
    		"total": d3.sum(leaves, function(d) {return parseInt(d.items.replace(/,/g, ''), 10);}),
    		"bars":[sum1,sum2]
    	} 
    })   
    .entries(dataView);

    // data by district
	var dataByDistrict = d3.nest()
    .key(function(d) { return d.pcode; })
    .rollup(function(leaves) { 
    	var sum1 = d3.sum(leaves, function(d){
    		if(d.type==itemType[0]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});
    	var sum2 = d3.sum(leaves, function(d){
    		if(d.type==itemType[1]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});

    	if(isNaN(sum1)){sum1=0};
    	if(isNaN(sum2)){sum2=0};

    	return {
    		"total": d3.sum(leaves, function(d) {return parseInt(d.items.replace(/,/g, ''), 10);}),
    		"bars":[sum1,sum2]
    	} 
    })   
    .entries(dataView);

    var districtCount = 0;

	$.each(dataByDistrict, function(i,d){
		$.each(data.adm3points, function(i,dd){
			if(d.key==dd.ocha_pcode){
				districtCount++;
				d.centroid_x = parseFloat(dd.centroid_x);
				d.centroid_y = parseFloat(dd.centroid_y);
			}
		});
	});

	var totalReports = 0;



    // data by vdc
	var dataByVdc = d3.nest()
    .key(function(d) { return d.vdc_pcode; })
    .rollup(function(leaves) { 
    	var sum1 = d3.sum(leaves, function(d){
    		if(d.type==itemType[0]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});
    	var sum2 = d3.sum(leaves, function(d){
    		if(d.type==itemType[1]){ return parseInt(d.items.replace(/,/g, ''), 10)};
    	});

    	if(isNaN(sum1)){sum1=0};
    	if(isNaN(sum2)){sum2=0};

    	return {
    		"total": d3.sum(leaves, function(d) {return parseInt(d.items.replace(/,/g, ''), 10);}),
    		"bars":[sum1,sum2]
    	} 
    })   
    .entries(dataView);

    var vdcCount = 0;

	// $.each(dataByVdc, function(i,d){
	// 	$.each(data.adm3points, function(i,dd){
	// 		if(d.key==dd.ocha_pcode){
	// 			districtCount++;
	// 			d.centroid_x = parseFloat(dd.centroid_x);
	// 			d.centroid_y = parseFloat(dd.centroid_y);
	// 		}
	// 	});
	// });

	d3.select('#chartTitle tspan').text(districtCount +' RECEIVING DISTRICTS');

    //**************************
    // TOTAL FIGURES
    //**************************

    var total0 = d3.sum(dataView, function(d){ if(d.type==itemType[0]){ return parseInt(d.items.replace(/,/g, ''), 10)}; });
    var total1 = d3.sum(dataView, function(d){ if(d.type==itemType[1]){ return parseInt(d.items.replace(/,/g, ''), 10)}; });

    d3.select('#PlasticSheets #ItemValue tspan')
    .text(addCommas(total0));

	d3.select('#SolarLanterns #ItemValue tspan')
    .text(addCommas(total1));

    // pipeline

    var pipeline0 = d3.sum(dataPipeline, function(d){ if(d.type==itemType[0]){ return parseInt(d.items.replace(/,/g, ''), 10)}; });
    var pipeline1 = d3.sum(dataPipeline, function(d){ if(d.type==itemType[1]){ return parseInt(d.items.replace(/,/g, ''), 10)}; });

    d3.select('#pipeLine #pipelinePlasticSheets tspan')
    .text(addCommas(pipeline0));

	d3.select('#pipeLine #pipelineSolarLamps tspan')
    .text(addCommas(pipeline1));

	//**************************
	// WORLD BORDERS
	//**************************
	var worldLayer = map.addVectorPolygon({
	    'source': data.world, 
	    'class': "world",
	    'fillOpacity': 0,
	    'strokeOpacity': 1,
	    'strokeWidth': 1,
	    'strokeColor': '#FFF',
	    'frame': [1,2,3]
	});

	worldLayer
    .style('fill', function(d){
        if(d.properties.FIPS != 'NP'){
            return '#E5E5E5';
        } else { 
            return '#CACACA';
        }
    })
    .style('fill-opacity', function(d){
        if(d.properties.FIPS != 'NP'){
            return 0.5;
        } else { 
            return 0.5;
        }
    }); 

    //**************************
    // MAP MASK
    //**************************

    var maskPath = [
    {name: 'name', lat: 26.206553, lon: 88.332449},
    {name: 'name', lat: 26.534609, lon: 85.156853},
    {name: 'name', lat: 27.919787, lon: 84.071691},
    {name: 'name', lat: 28.932639, lon: 84.391248},
    {name: 'name', lat: 28.324918, lon: 86.328561},
    {name: 'name', lat: 27.949196, lon: 88.405681},

	];

	var mask = map.addMask({
    'class': 'mapmask', 
    'outline': false, 
    'path': maskPath,
    'frame': [1,2,3]
	});

	//**************************
	// COUNTRY LABELS
	//**************************
    var countryLabels = [
	    {name: 'INDIA', lat: 26.520475, lon: 85.438853},
	    {name: 'CHINA', lat: 28.354660, lon: 86.213899},
	];

	var countryNames = map.addTextLabels({
	    'source': countryLabels,
	    'class': "countryNames",
	    'fontSize': '14px',
	    'fontWeight': 'normal', 
	    'fontFamily': 'arial',
	    'fontColor': '#9e9e9e', 
	    'fontStyle': 'normal', 
	    'textAnchor': 'middle',
	    'xOffset': 8, // offset label horizontally
	    'yOffset': 4, // offset label vertically
	    'opacity': 1,
	    'fade': 0, // fade in labels in miliseconds
	    'delay': 0, // delay showing labels in miliseconds
	    'frame': [1,2,3]
	});

	//**************************
	// ADMIN LEVEL 1
	//**************************
	var adm1 = map.addVectorPolygon({
	    'source': data.adm1, 
	    'class': "adm1",
	    'fillOpacity': 1,
	    'fill': '#FFF',
	    'strokeOpacity': 1,
	    'strokeWidth': 2,
	    'strokeColor': '#969696',
	    'frame': [1,2,3]
	});

	//**************************
	// ADMIN LEVEL 1 LABELS
	//**************************
    var regionLabels = [
	    {name: 'FAR-WESTERN', lat: 29.376879, lon: 80.898887},
	    {name: 'MID-WESTERN', lat: 28.916311, lon: 82.382042},
	    // {name: 'WESTERN', lat: 28.308702, lon: 83.810264},
	    {name: 'WESTERN', lat: 28.310810, lon: 84.252552},
	    {name: 'CENTRAL', lat: 27.519755, lon: 85.342296},
	    {name: 'EASTERN', lat: 27.151512, lon: 87.31985},
	];

	var regionNames = map.addTextLabels({
	    'source': regionLabels,
	    'class': "regionNames",
	    'fontSize': '13px',
	    'fontWeight': 'normal', 
	    'fontFamily': 'arial',
	    'fontColor': '#9e9e9e', 
	    'fontStyle': 'normal', 
	    'textAnchor': 'middle',
	    'xOffset': 8, // offset label horizontally
	    'yOffset': 4, // offset label vertically
	    'opacity': 1,
	    'fade': 0, // fade in labels in miliseconds
	    'delay': 0, // delay showing labels in miliseconds
	    'frame': [1,2,3]
	});

	//**************************
	// ADMIN LEVEL 3 (DISTRICT)
	//**************************
	var adm3 = map.addVectorPolygon({
	    'source': data.adm3, 
	    'class': "adm3",
	    // 'fillOpacity': 0,
	    'fill': 'transparent',
	    'strokeOpacity': 1,
	    'strokeWidth': 1,
	    'strokeColor': '#BFBFBF',
	    'frame': [1,2,3]
	});




	//********************
	// DISTRICT CHOROPLETH
	//********************

	var maxDistrict = d3.max(dataByDistrict, function(d){ return d.values.total;});

	d3.select('#mapMax').text(addCommas(Math.ceil(maxDistrict/1000)*1000))
	.style('text-anchor', 'middle');
	// .attr('x', 400);

    var colorD = d3.scale.linear()
    .domain([0, maxDistrict])
    .range([colorbrewer.Blues[6][1],'#00508F']);


	var district = map.addVectorPolygon({
	    'source': data.adm3, 
	    'class': "district selected",
	    'fillOpacity': 0.7,
	    'fill': '#FFF',
	    'strokeOpacity': 0.15,
	    'strokeWidth': 0.5,
	    'strokeColor': '#000',
	    'frame': [1]
	});

	district
	.style('fill', function(d){
		var pcode = d.properties.pcode;
		var name = d.properties.name;
		var val = 0;

		$.each(dataByDistrict, function(i,d){
			if(d.key == pcode){
				val = d.values.total;
				d.name = name;

			}
		});

		if(val>0){return colorD(val)}else{return '#FFF';};

	});



	//**************************
	// DISTRICT LABEL POINT VALUES
	//**************************

	map.addCustomLabels(dataByDistrict);

	// MOUSE BEHAVIOR 

	var districtMouse = map.addVectorPolygon({
	    'source': data.adm3, 
	    'class': "districtMouse selected",
	    'fillOpacity': 0,
	    'fill': 'darkblue',
	    'strokeOpacity': 0,
	    'strokeWidth': 0.5,
	    'strokeColor': '#000',
	    'frame': [1,2,3]
	});

	districtMouse
	.on('mouseover', function(d){
		var dist = d3.select(this)
		.style('fill-opacity', 0.01)
		.style('stroke-opacity', 0.5);

		var pcode = d.properties.pcode;
		var name = d.properties.name;
		var vals = [0,0];

		$.each(dataByDistrict, function(i,d){
			if(d.key == pcode){
				vals = d.values.bars;
			}
		});

		d3.select('#dM').transition().duration(200).style('opacity', 1);
		d3.selectAll('.mTitle').text(name);
		d3.selectAll('.mSubTitle1').text('PLASTIC SHEETS');
		d3.selectAll('.mSubTitle2').text('SOLAR LAMPS');
		d3.selectAll('.mFigure1').text(addCommas(vals[0]));
		d3.selectAll('.mFigure2').text(addCommas(vals[1]));
		d3.selectAll('.mBox1').style('fill', '#2971B7');
		d3.selectAll('.mBox2').style('fill', color[1]);
	})
	.on('mouseout', function(){
		d3.select(this)
		.style('fill-opacity', 0)
		.style('stroke-opacity', 0);

		d3.select('#dM').transition().duration(200)
		.style('opacity', 0)
		.each("end", function(d){
			d3.select(this).attr('transform', 'translate(-100,-100)');
		});
		
	})
	.on('mousemove', function(){

		coordinates = d3.mouse(this);
		var x = coordinates[0];
		var y = coordinates[1];

		d3.select('#dM')
		.attr('transform', 'translate('+(x+10)+','+(y+5)+')');
	});





	//********************
	// VDC CHOROPLETH
	//********************

	var maxVdc = d3.max(dataByVdc, function(d){ if(d.key !== 'undefined'){return d.values.total;}});

	// d3.select('#mapMax').text(addCommas(Math.ceil(maxVdc/100)*100))
	// .style('text-anchor', 'middle');
	// // .attr('x', 400);

    var colorVdc = d3.scale.linear()
    .domain([0, maxVdc])
    .range([colorbrewer.Blues[6][1],'#00508F']);


	var vdc = map.addVectorPolygon({
	    'source': data.adm4, 
	    'class': "vdc selected",
	    'fillOpacity': 0.7,
	    'fill': '#FFF',
	    'strokeOpacity': 0.15,
	    'strokeWidth': 0.5,
	    'strokeColor': '#000',
	    'frame': [2]
	});

	vdc
	.style('fill', function(d){
		var pcode = d.properties.vdc_pcode;
		var name = d.properties.name;
		var val = 0;

		$.each(dataByVdc, function(i,d){
			if(d.key == pcode){
				val = d.values.total;
				d.name = name;

			}
		});

		if(val>0){return colorVdc(val)}else{return '#FFF';};
	});


	vdc.on('mouseover', function(d){
		var dist = d3.select(this)
		.style('fill-opacity', 0.75)
		.style('stroke-opacity', 0.40);

		var pcode = d.properties.vdc_pcode;
		var name = d.properties.name;
		var vals = [0,0];

		$.each(dataByVdc, function(i,d){
			if(d.key == pcode){
				vals = d.values.bars;
			}
		});

		d3.select('#dM').transition().duration(200).style('opacity', 1);
		d3.selectAll('.mTitle').text(name);
		d3.selectAll('.mSubTitle1').text('PLASTIC SHEETS');
		d3.selectAll('.mSubTitle2').text('SOLAR LAMPS');
		d3.selectAll('.mFigure1').text(addCommas(vals[0]));
		d3.selectAll('.mFigure2').text(addCommas(vals[1]));
		d3.selectAll('.mBox1').style('fill', '#2971B7');
		d3.selectAll('.mBox2').style('fill', color[1]);
	})
	.on('mouseout', function(){
		d3.select(this)
		.style('fill-opacity', 0.7)
		.style('stroke-opacity', 0.15);

		d3.select('#dM').transition().duration(200)
		.style('opacity', 0)
		.each("end", function(d){
			d3.select(this).attr('transform', 'translate(-100,-100)');
		});
		
	})
	.on('mousemove', function(){

		coordinates = d3.mouse(this);
		var x = coordinates[0];
		var y = coordinates[1];

		d3.select('#dM')
		.attr('transform', 'translate('+(x+10)+','+(y+5)+')');
	});





	//********************
	// BUILDINGS DESTROYED 
	//********************


	var destroyed = map.addVectorPolygon({
	    'source': data.adm3, 
	    'class': "destroyed",
	    'fillOpacity': 0.75,
	    'fill': '#FFF',
	    'strokeOpacity': 0.15,
	    'strokeWidth': 0.5,
	    'strokeColor': '#000',
	    'frame': [3]
	});


	var totalDestroyed = d3.sum(data.deaths, function(d) { return parseFloat(d.GovtBuild_Damage.replace(/,/g, '')) + parseFloat(d.PublicBuild_Damage.replace(/,/g, '')); });

	// define range bands
	var legend = d3.scale.threshold()
    .domain([1, 10000, 20000,30000,40000,50000,1000000])
    .range(['0','1 - 9,999','10,000 - 19,999','20,000 - 29,999','30,000 - 39,999','40,000 - 49,999', '50,000+']);

	var colorDestroyed = d3.scale.threshold()
    .domain([1, 10000, 20000,30000,40000,50000,10000000])
    .range(['#FFF','#FFF3E2','#FFD69D','#FFC16A','#FFAE3C','#FF9B0D','#E48A09']);

// DEATHS

	var legXOffset = 320;
	var legYOffset = 480;

	var legendDestroyed = mapsvg.append('g')
	.attr('class','legendDestroyed frame frame3')
	.attr('transform', 'translate('+legXOffset+','+legYOffset+')');

	legendDestroyed.append('text')
	.attr('x', 0)
	.attr('y', -10)
	.style('font-family', "'Open Sans', sans-serif")
	.style('font-weight', 'bold')
	.style('font-size', '12px')
	.text('Buildings damaged');

	var legendRowHeight = 15;
	var legendRowWidth = 25;

	var legendDestroyedRow = legendDestroyed
	.selectAll('.legendDestroyedRow')
	.data(colorDestroyed.range())
	.enter()
	.append('g')
	.attr('transform', function(d,i){return 'translate(0,'+((legendRowHeight+3)*i)+')';});

	legendDestroyedRow
	.append('rect')
	.style('stroke','#C6C6C6')
	.style('stroke-width',0.5)
	.attr('width', legendRowWidth)
	.attr('height', legendRowHeight)
	.attr('x', 0)
	.attr('y', 0)
	.style('fill', function(d,i){
		return colorDestroyed.range()[i];
	})

	legendDestroyedRow
	.append('text')
	.attr('x', 30)
	.attr('y', 12)
	.style('font-size', '11px')
	.style('fill', '#000')
	.text(function(d,i){
		return legend.range()[i];
	});



	destroyed.style('fill', function(d){

		var govBuildings = 0;
		var publicBuildings = 0;


		$(data.deaths).each(function(){
			if(this.OCHA_PCODE==d.properties.pcode){
				govBuildings = parseFloat(this.GovtBuild_Damage.replace(/,/g, ''));
				publicBuildings = parseFloat(this.PublicBuild_Damage.replace(/,/g, ''));

			}
	    });	

	    return colorDestroyed(govBuildings+publicBuildings);

	});


	destroyed
	.on('mouseover', function(d){
		var dist = d3.select(this)
		.style('fill-opacity', 0.8)
		.style('stroke-opacity', 0.6);

		var severityClass = "No Data";
		var govBuildings = 0;
		var publicBuildings = 0;
		var name;

		$(data.deaths).each(function(){
			if(this.OCHA_PCODE==d.properties.pcode){
				severityClass = this.severity_class;
				name = d.properties.name;

				if(this.GovtBuild_Damage>0){
					govBuildings = parseFloat(this.GovtBuild_Damage.replace(/,/g, ''))
				} else {
					govBuildings = 0;
				}

				if(this.PublicBuild_Damage>0){
					publicBuildings = parseFloat(this.PublicBuild_Damage.replace(/,/g, ''))
				} else {
					publicBuildings = 0;
				}

			}
	    });	

		d3.select('#dM').style('opacity', 1);
		d3.selectAll('.mTitle').text(name);
		d3.selectAll('.mSubTitle1').text('PUBLIC BUILDINGS');
		d3.selectAll('.mSubTitle2').text('GOV. BUILDINGS');
		d3.selectAll('.mFigure1').text(addCommas(publicBuildings));
		d3.selectAll('.mFigure2').text(addCommas(govBuildings));
		d3.selectAll('.mBox1').style('fill', colorDestroyed(publicBuildings));
		d3.selectAll('.mBox2').style('fill', colorDestroyed(govBuildings));


	})
	.on('mouseout', function(){
		d3.select(this)
		.style('fill-opacity', 0.75)
		.style('stroke-opacity', 0.15);

		d3.select('#dM').style('opacity', 0)
		.attr('transform', 'translate(-100,-100)');


	})
	.on('mousemove', function(){

		coordinates = d3.mouse(this);
		var x = coordinates[0];
		var y = coordinates[1];

		d3.select('#dM')
		.attr('transform', 'translate('+(x+10)+','+(y+5)+')');

	});


	//**************************
	// print date
	//**************************

	var dformat = d3.time.format("%d %b %Y");
	var fileformat = d3.time.format("%Y-%m-%d");


	var today = new Date();
	d3.select('#printDate tspan').text('As of '+dformat(today));

	document.title='UNHCR Nepal - Distributions - '+fileformat(today);

	//**************************
	// DATE CHART
	//**************************

	var dateChartHeight = 120;

	var dateMax = d3.max(dataByDate, function(d) { return d.values.total; });

	dateMax = Math.ceil(dateMax/1000)*1000;

	var dateYScale = d3.scale.linear()
	.range([0,dateChartHeight])
	.domain([0,dateMax]);

	var dWidth = 700;
	var colOffset = 30;

	var xDate = d3.time.scale().range([0, dWidth]);

	xDate.domain(d3.extent(dataByDate, function(d) { return parseDate(d.key); })).nice();
	
	var startDate = xDate.domain()[0];
	var startDate = new Date(2015,03,25);

	xDate.domain(d3.extent(dataByDate, function(d) { return parseDate(d.key); })).nice(d3.time.month);
	var endDate = xDate.domain()[1];

	// endDate.setMonth( endDate.getMonth( ) + 1 );

	xDate.domain([startDate, endDate]);

	var diff =  Math.abs(Math.floor(( xDate.domain()[0] - xDate.domain()[1] ) / 86400000));

	var colWidth = (dWidth/diff)-5;

	var dateChartContainer = mapsvg
	.append("g")
	.attr('class', 'dateChartContainer')
	.attr("transform", "translate(" + 330 + "," + 660 + ")");

	dateChartContainer.append('line')
	.attr("x1", -3)
	.attr("y1", 0)
	.attr("x2", dWidth+3)
	.attr("y2", 0)
	.attr('stroke-width', 0.5)
	.attr('stroke', '#E5E5E5');

	dateChartContainer.append('line')
	.attr("x1", -3)
	.attr("y1", dateYScale(dateMax/2))
	.attr("x2", dWidth+3)
	.attr("y2", dateYScale(dateMax/2))
	.attr('stroke-width', 0.5)
	.attr('stroke', '#E5E5E5');

	var dateCols = dateChartContainer.selectAll(".col")
	.data(dataByDate)
	.enter()
	.append('g')
	.attr("class", "col")
	.attr("transform", function(d,i){
		var xO = xDate(parseDate(d.key));
		return  "translate(" + xO + "," + 0 + ")";
	})
	.on('mouseover', function(d){

		d3.select(this)
		.style('fill-opacity', 0.9)

		d3.select(this).select('.buttonMask').style('fill-opacity', 0.05);

		var format = d3.time.format("%a %d %b %Y");
		var name = format(parseDate(d.key));
		var vals = d.values.bars;

		d3.select('#dM').transition().duration(200).style('opacity', 1);
		d3.selectAll('.mTitle').text(name);
		d3.selectAll('.mSubTitle1').text('PLASTIC SHEETS');
		d3.selectAll('.mSubTitle2').text('SOLAR LAMPS');
		d3.selectAll('.mFigure1').text(addCommas(vals[0]));
		d3.selectAll('.mFigure2').text(addCommas(vals[1]));
		d3.selectAll('.mBox1').style('fill', '#2971B7');
		d3.selectAll('.mBox2').style('fill', color[1]);
	})
	.on('mouseout', function(){
		d3.select(this)
		.style('fill-opacity', 1)

		d3.select(this).select('.buttonMask').style('fill-opacity', 0);

		d3.select('#dM').transition().duration(200)
		.style('opacity', 0)
		.each("end", function(d){
			d3.select(this).attr('transform', 'translate(-100,-100)');
		});
		
	})
	.on('mousemove', function(){
		var t = d3.transform(d3.select(this).attr("transform")),
	    xt = t.translate[0],
	    yt = t.translate[1];
		coordinates = d3.mouse(this);
		var x = coordinates[0]+xt+330;
		var y = 670;
		d3.select('#dM')
		.attr('transform', 'translate('+(x+10)+','+(y+5)+')');
	});

	dateCols.append('rect')
	.attr('fill', 'grey')
	.style('fill-opacity', 0)
	.attr('class', 'buttonMask')
	.attr('x',-2.5)
	.attr('y',0)
	.attr('width', colWidth+5)
	.attr('height', dateYScale(dateMax));
	
	var dateBar = dateCols.selectAll('.bar')
	.data(function(d,i){ return d.values.bars;})
	.enter()
	.append("rect")
	.attr('class', 'bar')
	.attr("width", colWidth)
	.attr("y", 0)
	.attr("x", 0)
	.attr("height", function(d,i){
		return dateYScale(d);
	})
	.attr("y", function(d,i){
	var v;
		if(i>0){
			v = d3.select(this.parentNode).datum().values.bars[i-1] + d;
		} else {
			v = d;
		}
		return dateChartHeight - dateYScale(v);
	})
	.attr("x", 0)
	.attr("height", function(d,i){
		return dateYScale(d);
	})
	.style('stroke', '#FFF')
	.style('stroke-opacity', 0.5)
	.attr('fill', function(d,i,j){
		return color[i];
	});


	var xAxis = d3.svg.axis()
	.scale(xDate)
	.orient("bottom")
	.tickSize(0)
	.ticks(3)
	.tickPadding(9)
	.tickFormat(d3.time.format("%d %b"));

	dateChartContainer.append("g")
	.attr("class", "xAxis axis")
	.attr("transform", "translate("+colWidth/2+"," + 120 + ")")
	.call(xAxis);

	var xAxisGrid = xAxis
	.tickSize(5, 0)
	.tickFormat("")
	.tickPadding(0)
	.orient("bottom");

	dateChartContainer.append("g")
	.classed('x', true)
	.classed('xgrid', true)
	.attr("transform", "translate("+colWidth/2+"," + 120 + ")")
	.call(xAxisGrid);

	dateChartContainer.append('line')
	.attr("x1", -10)
	.attr("y1", 120)
	.attr("x2", dWidth+10)
	.attr("y2", 120)
	.attr('stroke-width', 1)
	.attr('stroke', '#AEAEAE');

	dateChartContainer.append('line')
	.attr("x1", -4)
	.attr("y1", 0)
	.attr("x2", -4)
	.attr("y2", 120)
	.attr('stroke-width', 1)
	.attr('stroke', '#AEAEAE');

	dateChartContainer.append('line')
	.attr("x1", -4)
	.attr("y1", 0)
	.attr("x2", -10)
	.attr("y2", 0)
	.attr('stroke-width', 1)
	.attr('stroke', '#AEAEAE');

	dateChartContainer.append('text')
	.attr("y", 3)
	.attr("x", -13)
	.attr('id', 'dateChartMax')
	.style("text-anchor", 'end')
	.style('font-size', 9)
	.text(1000);

	dateChartContainer.append('line')
	.attr("x1", -4)
	.attr("y1", dateYScale(dateMax/2))
	.attr("x2", -10)
	.attr("y2", dateYScale(dateMax/2))
	.attr('stroke-width', 1)
	.attr('stroke', '#AEAEAE');

	dateChartContainer.append('text')
	.attr("y", function(){ return dateYScale(dateMax/2)+3})
	.attr("x", -13)
	.attr('id', 'dateChartMid')
	.style("text-anchor", 'end')
	.style('font-size', 9)
	.text(addCommas(dateMax/2));

	dateChartContainer.append('text')
	.attr("y", dateYScale(dateMax)+3)
	.attr("x", -13)
	.style("text-anchor", 'end')
	.style('font-size', 9)
	.text(0);

	d3.select('#dateChartMax').text(addCommas(dateMax));



	//**************************
	// TOP 10 DISTRICTS CHART
	//**************************
	var topDistricts = viz.tableBar({
	    'source': dataByDistrict, 
	    'appendTo': mapsvg, 
	    'id': 'topDistricts', 
	    'class': "topDistricts",
	    'width': 200,
	    'height': 410,
	    'xOffset': 105,
	    'yOffset': 385,
	    'limit': 20,
	    'title': '',
	    'valueField': 'Deaths',
	    'nameField': 'name',
	    'fillOpacity': 1,
	    'fill': '#cb181d',
	    'frame': [1,2,3]
	});


	//**************************
	// TOOLTIPS 
	//**************************

	var dM = mapsvg.append('g')
	.attr('id', 'dM')
	.attr('transform', 'translate(-100,-100)')
	.style('opacity', 0);

	dM.append('rect')
	.attr('width', 110)
	.attr('height', 95)
	.style('fill', '#FFF')
	.style('fill-opacity', 0.9);

	dM.append('text')
	.attr('x', 5)
	.attr('y', 15)
	.attr('class', 'mTitle')
	.text('District');

	dM.append('text')
	.attr('x', 5)
	.attr('y', 31)
	.attr('class', 'mSubTitle1')
	.text('POPULATION');

	dM.append('rect')
	.attr('class', 'mBox1')
	.attr('x', 5)
	.attr('y', 37)
	.attr('height', 10)
	.attr('width', 3)
	.style('fill', 'blue');

	dM.append('text')
	.attr('x', 12)
	.attr('y', 46)
	.attr('class', 'mFigure1')
	.text('n/a');

	dM.append('text')
	.attr('x', 5)
	.attr('y', 65)
	.attr('class', 'mSubTitle2')
	.text('HOUSEHOLDS');

	dM.append('rect')
	.attr('class', 'mBox2')
	.attr('x', 5)
	.attr('y', 72)
	.attr('height', 10)
	.attr('width', 3)
	.style('fill', 'blue');

	dM.append('text')
	.attr('x', 12)
	.attr('y', 81)
	.attr('class', 'mFigure2')
	.text('n/a');


	//**************************
	// OFFICES
	//**************************

	var offices2 = [
	    {name: 'UNHCR Kathmandu', lat: 27.7016900, lon: 85.3206000}
	];

	var branchOffice = map.addSymbolPoints({
	    'source': offices2,
	    'icon': "./images/mapicons/Office2.svg", 
	    'class': "office2", 
	    'width': 14,
	    'height': 14,
	    'xOffset': -2,
	    'yOffset': 0,
	    'fontSize': 11, 
	    'fontWeight': 'bold', 
	    'fontColor': '#000',
	    'fontFamily': "'Open Sans', sans-serif",
	    'fontStyle': 'normal',
	    'opacity': 1,
	    'frame': [1,2,3],
	    'fade': 2000, 
	    'delay': 0,
	    'orientation': 'left'
	});


	var offices3 = [
	    {name: 'UNHCR Damak', lat: 26.6300, lon: 87.7000}
	];

	var subOffice = map.addSymbolPoints({
	    'source': offices3,
	    'icon': "./images/mapicons/Office3.svg", 
	    'class': "office2", 
	    'width': 14,
	    'height': 14,
	    'xOffset': 1,
	    'yOffset': 0,
	    'fontSize': 11, 
	    'fontWeight': 'bold', 
	    'fontColor': '#000',
	    'fontFamily': "'Open Sans', sans-serif",
	    'fontStyle': 'normal',
	    'opacity': 1,
	    'frame': [1,2,3],
	    'fade': 2000, 
	    'delay': 0,
	    'orientation': 'right'
	});


	//**************************
	// LINK TO INTERACTIVE
	//**************************

	d3.select('#interactiveLink')
	.append('a')
	.attr('href', 'http://data.unhcr.org/nepal/shelter')
	.append('text')
	.style('font-family', "'Open Sans', sans-serif")
	.style('font-weight', 'bold')
	.style('font-size', 14)
	.attr('fill', color[0])
	.attr('x', 1172)
	.attr('y', 53)
	.text('http://data.unhcr.org/nepal/shelter');



	//**************************
	// SVG ZOOM BUTTONS
	//**************************

var z = 0;
$( "g#zoomIn #icon" ).css('fill-opacity', 1);
$( "g#zoomOut #icon" ).css('fill-opacity', 0.2);
$( "g#zoomIn" ).css('cursor', 'pointer');
$( "g#zoomOut" ).css('cursor', 'pointer');


$( "g#zoomIn" ).on( "click", function(){
	z++;
	$( "g#zoomOut #icon" ).css('fill-opacity', 1);
	$('.zoomIn').trigger('click');
	if(z==2){
		$( "g#zoomIn #icon" ).css('fill-opacity', 0.2);

	}
});

$( "g#zoomOut" ).on( "click", function(){
	z=z-1;
	$( "g#zoomIn #icon" ).css('fill-opacity', 1);
	$('.zoomOut').trigger('click');
	if(z==0){
		$( "g#zoomOut #icon" ).css('fill-opacity', 0.2);
	}

});

	//**************************
	// FILTER TEXT
	//**************************

	// mapsvg.append('g')
	// .attr('transform', 'translate(30,675)')
	// .style('opacity', 0.5)
	// .append('text')
	// .text('FILTER OUTPUT');

	// mapsvg.append('g')
	// .attr('transform', 'translate(30,695)')
	// .style('opacity', 0.5)
	// .append('text')
	// .attr('id', 'filterText')
	// .text(JSON.stringify(filter));



	//********************
	// FRAME HANDLER
	//********************
	$('#framePrev, #leftButton').click(function(){
		var f = viz.prevFrame(1000);
		$('#lContent').scrollTop(0);
		updateSelect(f);
		$('#activeFrame').text(f);
	});
	
	$('#frameNext, #rightButton').click(function(){
		var f = viz.nextFrame(1000);
		$('#lContent').scrollTop(0);
		updateSelect(f);
		$('#activeFrame').text(f);
	});

    $('.selectFrame').on('click', function(){
        var id = $(this).attr('id');
        var text = $(this).text();
        viz.gotoFrame(id, 1000);
        $('#selectFrame .textlabel').text(text);
		$('#activeFrame').text(id);
    })

    function updateSelect(frame){
    	var text = $('#selectFrameDiv li:nth-child('+(frame)+')').text();
    	$('#selectFrame .textlabel').text(text);
    }

	viz.maxFrames(5);
	viz.gotoFrame(1,1);

	var f = 1; 

	d3.select("#MapTitle").style('text-anchor', 'middle');
	d3.select("#MapTitle tspan").attr('x', 0);

	d3.select('#buttonLeft').style('opacity', 0.2).attr('class', 'disabled')
	.on('click', function(){

		d3.select('#buttonRight').style('opacity', 1).attr('class', '');
		d3.select('#buttonLeft').style('opacity', 1).attr('class', '');

		// if(f==2){
		if(f>1){
			viz.prevFrame(1000);	
			d3.select("#MapTitle tspan").text('ITEMS DISTRIBUTED BY DISTRICT').style('font-size', '17px');
			f=f-1;
		}

		if(f==1){
			d3.select('#buttonLeft').style('opacity', 1).attr('class', 'disabled');
			d3.select('#buttonLeft').style('opacity', 0.2);
			d3.select('#buttonRight').style('opacity', 1).attr('class', '');

			d3.select('#mapMax').text(addCommas(Math.ceil(maxDistrict/1000)*1000))
			.style('text-anchor', 'middle')

		}

		if(f==2){
			d3.select("#MapTitle tspan").text('ITEMS DISTRIBUTED BY VDC').style('font-size', '17px');
		}
	});

	d3.select('#buttonRight').on('click', function(){

		d3.select('#buttonRight').style('opacity', 1).attr('class', '');
		d3.select('#buttonLeft').style('opacity', 1).attr('class', '');

		if(f<=3){
			viz.nextFrame(1000);
			f++;
		}

		if(f==2){
			d3.select("#MapTitle tspan").text('ITEMS DISTRIBUTED BY VDC').style('font-size', '17px');
		}

		if(f==3){
			d3.select('#buttonRight').style('opacity', 0.2).attr('class', 'disabled');
			d3.select('#buttonLeft').style('opacity', 1).attr('class', '');
			d3.select("#MapTitle tspan").text('BUILDINGS DAMAGED BY DISTRICT').style('font-size', '16px');
		}

		d3.select('#mapMax').text(addCommas(Math.ceil(maxVdc/100)*100))
		.style('text-anchor', 'middle');
	});


	d3.select('#buttonLeft').on('mouseover', function(){
		if($('#buttonLeft').attr('class')=='disabled'){
			d3.select(this).style('opacity', 0.2);
		} else {
			d3.select(this).style('opacity', 0.7);
		}
	})
	.on('mouseout', function(){
		if($('#buttonLeft').attr('class')=='disabled'){
			d3.select(this).style('opacity', 0.2);
		} else {
			d3.select(this).style('opacity', 1);
		}
	});


	d3.select('#buttonRight').on('mouseover', function(){
		if($('#buttonRight').attr('class')=='disabled'){
			d3.select(this).style('opacity', 0.2);
		} else {
			d3.select(this).style('opacity', 0.7);
		}
	})
	.on('mouseout', function(){
		if($('#buttonRight').attr('class')=='disabled'){
			d3.select(this).style('opacity', 0.4);
		} else {
			d3.select(this).style('opacity', 1);
		}
	});

	$('#donate').on('click', function(){
		window.open("http://donate.unhcr.org/international/nepal", "_blank");
	})

	d3.select("#donate").on('mouseover', function(){
		d3.select(this).selectAll('#bg').attr('fill', '#00669E');
	}).on('mouseout', function(){
		d3.select(this).selectAll('#bg').attr('fill', '#2971B7');
	});



	$(document).ready(function(){
		$("#loader").hide();
	});

});




//**************************
// MISC FUNCTIONS
//**************************	

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

function getToplineDate(str){
	var d = str.substring(0, 2);
	var m = str.substring(4, 5);
	var y = str.substring(6, 8);

	m = monthNames[m-1];
	var df = d + ' ' +m + ' 20'+y;

	return df;
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

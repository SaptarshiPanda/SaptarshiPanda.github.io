var map, geojson;
var selected, features, layer_name, layerControl;
var content;
var popup = L.popup();

// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// Map creation

map = L.map('map', {
   
	crs: L.CRS.EPSG4326,
	center: [23.00, 82.00],
	zoom: 6,
	zoomControl: false
	// layers: [grayscale, cities]
});

var satellite = L.tileLayer('https://wi.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
   // maxZoom: 23,
		attribution: 'Source: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA FSA, USGS, Getmapping, Aerogrid, IGN, IGP, and the GIS User Community'
	}).addTo(map);
	
var hillshade = L.tileLayer('https://whi.maptiles.arcgis.com/arcgis/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
	//maxZoom: 19,
	attribution: 'Sources: Esri, Airbus DS, USGS, NGA, NASA, CGIAR, N Robinson, NCEAS, NLS, OS, NMA, Geodatastyrelsen, Rijkswaterstaat, GSA, Geoland, FEMA, Intermap, and the GIS user community',
});

var overlays = L.layerGroup();
var base = L.layerGroup();
base.addLayer(hillshade, 'hillshade');
base.addLayer(satellite, 'satellite');

layerControl = L.control.layers().addTo(map);

layerControl.addBaseLayer(hillshade, "hillshade");
layerControl.addBaseLayer(satellite, "satellite");

// Zoom bar
var zoom_bar = new L.Control.ZoomBar({
	position: 'topleft'
}).addTo(map);

// mouse position
L.control.mousePosition({
	position: 'bottomleft',
	prefix: "lat : long",
}).addTo(map);

//scale
L.control.scale({
	position: 'bottomleft'
}).addTo(map);

//geocoder
L.Control.geocoder({
	position: 'topright'
}).addTo(map);

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
// Initialising all variables

var i=0;
var marker, popup, poi; // poi - points of interest
marker = L.marker();

// create popup contents
const dict = {
	4:0,
	5:1,
	8:2,
	13:3,
	15:4
};

// Content asignment
var button_texts = ['Airport','Airport','Metro','Home','Airport'];
var button_icons = ['"Utilities/airport-icon.jpg"','"Utilities/airport-icon.jpg"','"Utilities/metro.png"','"Utilities/home-icon.png"','"Utilities/airport-icon.jpg"'];
var pop_text_bef = ['','','<center><img src="Utilities/pandal.gif" height="150px" width="150px"/></center>','And as a gentleman should, I drop you off at home','Finally end of the double trip!!']
var pop_text_aft = ['','','Tha\'s it! Next meet straight at Shillong!','...umm I\'ll reach home in an hour so go ahead click the button.','Skip the airport! Let\'s roam around!!']

var customPopup;
function cpop(){
	customPopup = pop_text_bef[dict[i]]+'<br><br><button id="dest" onclick = "del_route()"><img src='+button_icons[dict[i]]+' height="20px" width="20px"></img> '+button_texts[dict[i]]+'</button><br><br>'+pop_text_aft[dict[i]];
	return customPopup;
};

// specify popup options 
var customOptions =
    {
    'maxWidth': '400',
    'width': '200',
    'className' : 'popupCustom'
    }

//Creating marker locations
const marker_lat_longs = [[25.58935,91.89828], // Golf 0
	[25.61048,91.94879], // NIFT Shillong 1
	[25.575,91.887], // Wards 2
	[25.5682,91.8916], // Cathedral 3
	[25.61048,91.94879], // NIFT Shillong 4
	[26.105, 91.589], // GHY airport 5
	[22.6424,88.43937], // KOL airport 6
	[22.5202,88.37183], // Ballygunge Pandal hopping 7
	[22.51649,88.34594], // Kalighat Metro 8
	[25.58475,91.89239], // My Hostel 9
	[25.575,91.887], // Wards 10
	[25.61048,91.94879], // NIFT Shillong 11
	[22.55534,88.35025], // Park Street 12
	[22.54079,88.39622], // Science City 13
	[22.6424,88.43937], // KOL airport 14
	[26.105, 91.589], // GHY airport 15
	[26.189,91.74261], // Brahmaputra Heritage Park 16
	[25.61048,91.94879], // NIFT Shillong 18
	];

// Creating marker text content
const texts = ['<strong>June 6, 2022</strong>&nbsp;|&nbsp;<i>Golf Links</i><br>\
	I think this is the exact spot we sat in a circle. Sleepy and grumpy me, irritated you - aha, what a first impression. Was about to mention "First movie" but then I realised movies er naam e Bijoiu te <i>Prithviraaj</i> ar Prime Video Watch Party te <i>The Prestige baad diye kissu nei.</i>',
	'<strong>August 28, 2022</strong>&nbsp;|&nbsp;<i>NIFT Shillong</i><br>\
	Visiting your campus for the first time. Day started off with an uncertainity but eventually to our great delight, the hangout plan was successful. Waterfall dekhte time slippery stones pe support dene ke naam pe hand holding krr liya hehe. Constantly chatting, staying close by and yeah, the "offering my jacket" ....those were the first glimpses of affection.',
	'<strong>September 3, 2022</strong>&nbsp;|&nbsp;<i>Lady Hydari Park, Ward\'s Lake</i><br>\
	Hanging out is now regular (weekends only, different college struggles ). First time visitng Wards and Hydari, going for a boating, taking the long route from Golf to PB so we can talk more, taking random selfies and so on.... A whole bunch of flirting era thus started, combined with late night calls and texts. Crazy how the same excruciatingly long road feels extremely short and enjoyable with the right person. ',
	'<strong>September 11, 2022</strong>&nbsp;|&nbsp;<i>Binge Biryani, St. Mary\'s Cathedral</i><br>\
	Quite an important day 😁. More important than the party, even more than the awesome gift, was the urge to spend "10 minutes more please" together. That was the establishment of whatever was to come. And yeah, during the late night call till 2AM, wasn\'t bluffing when I said talking to you kept me from feeling the pain of GPL.',
	'<strong>October 1, 2022</strong>&nbsp;|&nbsp;<i>NIFT Shillong to Guwahati Airport</i><br>\
	This marks our first long trip together basically. Technically our first date at Jiva also hehe. I proposed the idea for a Durga puja outing and just hoped it happens <i>(spoiler alert : it did)</i>. A whole 5 hour long taxi ride and we couldn\'t stop chatting. Nikhila and Tarun are the unexpected witnesses😂. But darling, next time onwards, I\'m playing my fav songs during the trip.',
	'<i>Guwahati Airport</i><br>\
	Maintaining your track record, the flight came half an our late but it was a blessing in disguise. Not just the extra 30 mins of being together, the sky we saw was something magnificent. Should\'ve kissed you on the flight though, I regret that.',
	'<i>Kolkata Airport</i><br>\
	So after about 10 long hours of journey together, it was goodbye time. Went home with the hope of a pandal hopping together.',
	'<strong>October 3, 2022</strong>&nbsp;|&nbsp;<i>Ballygunge Station to Kalighat Metro</i><br>\
	Headache, 15 hours of journey within 24 hours, hours of walking with friends, but still when you asked if I could to hangout the next day, I was obviously ready to go. Wishes do come true. And even gods helped us, only day during whole Durga Puja when it wasn\'t hot and sunny in the noon. Has to be one of my favourite pandal hoppings till date.',
	'',
	'<strong>October 22, 2022</strong>&nbsp;|&nbsp;<i>Terrace of my hostel XD</i><br>\
	Ah yes, the D-Day!About 10 PM at night and I asked if we holding hands in public can no longer be a awkward thing. Long wait and finally after a lot of confusions, fear and shyness, it was finally official!<br>(This is the pic of a random night from my terrace btw)',
	'<strong>October 24, 2022</strong>&nbsp;|&nbsp;<i>Ward\'s Lake</i><br>\
	Officially married at the local temple XD. JK, it was a rainy Diwali (thanks to Netflix). Well you got a proper proposal that day tho and yes, hand holding was no more awkward❤️.',
	'<strong>November 5, 2022</strong>&nbsp;|&nbsp;<i>NIFT Shillong</i><br>\
	Mentioning this as this was the spot of our first kiss. Yea first one was just a peck on the cheeks, dear onlookers. Next ones? Ummm..... ssslightly different. But on a serious note, somebody put tapes to our lips..... Seriously.',	
	'<strong>December 26, 2022</strong>&nbsp;|&nbsp;<i>Kolkata hangout</i><br>\
	Plans gone wrong so we just travelled .... A LOT!! But however disastrous planning (the very park we wanted to go to was closed smh) it was, we enjoyed every moment of hanging out after a whole month\'s gap. Oh, and lip kiss😘.',
	'',
	'<strong>January 14, 2022</strong>&nbsp;|&nbsp;<i>Kolkata to Shillong return</i><br>\
	After multiple date changes ..... finally we got on the flight. And as is the tradition with your flights, we did a double trip because of haze. But anyways, we two slept so deep on the flight resting our head on each other, flight attendant had to wake us up for refreshments XD. Next time on think before seat booking though.',
	'',
	'<strong>January 14, 2022</strong>&nbsp;|&nbsp;<i>Brahmaputra River Heritage Park</i><br>\
	Too tiring journey, but still date to bnta hai. Nice evening out there. That\'s it...... that was the day!! Go on click "Next", we stayed at Airport Parking lot only.',
	'Well skipped too many stuffs but yeah we had lot\'s of happy moments till date. Quarrels, laughs, missing each other every day, helping out at times, scolding for not taking care of health..... the complete package of our story. This is just the end of this version of the site, will keep this one updated I hope. Click on "End". Sayonara!'
];

// Creating image content
const images = ['<img src="Utilities/Golf.jpg" height="200px" width="300px"/>', //1
	'<img src="Utilities/Nift Shillong.jpg" height="170px" width="300px"/>', // 2
	'<img src="Utilities/wards.gif" height="200px" width="300px"/>', // 3
	'<img src="Utilities/bday.gif" height="200px" width="300px"/>', // 4
	'', // 5
	'',
	'<img src="Utilities/Airport.gif" height="200px" width="300px"/>', // 7
	'', // 8
	'', // 9
	'<img src="Utilities/hostel.jpg" height="250px" width="270px"/>', // 10
	'<img src="Utilities/diwali.gif" height="200px" width="300px"/>', // 11
	'<img src="Utilities/kiss.gif" height="200px" width="300px"/>', // 12
	'', // 13
	'', // 14
	'', // 15
	'', // 16
	'<img src="Utilities/Brahmaputra.gif" height="200px" width="300px"/>', // 17
	'' // 18
];;
var photoImg = images[i];

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Routes Creation

// Shillong to Guwahati route
function ShlToGhy(){

	var route = L.Routing.control({
	  waypoints: [
		L.latLng(25.61048,91.94879),
		L.latLng(26.105, 91.589)
	  ],
	  show : false,
	  routeWhileDragging: true,
		fitSelectedRoutes: false
	}).on('routesfound', function (e) {
				var routes = e.routes;

				e.routes[0].coordinates.forEach(function (coord, index) {
					setTimeout(function () {
						car.setLatLng([coord.lat, coord.lng]);
						// map.panTo(car.getLatLng(),10);
					}, 2 * index)
				});
		});
	return route;
}

// Pandal hopping
function pandal(){
	var route = L.Routing.control({
	  waypoints: [
		L.latLng(22.5202,88.37183),
		L.latLng(22.51649,88.34594)
	  ],
	  show : false,
	  routeWhileDragging: true,
		fitSelectedRoutes: false
	}).on('routesfound', function (e) {
				var routes = e.routes;
				e.routes[0].coordinates.forEach(function (coord, index) {
					setTimeout(function () {
						car.setLatLng([coord.lat, coord.lng]);
					}, 150 * index)
				});
		});
	return route;
}

function hangout(){
	var route = L.Routing.control({
	  waypoints: [
		L.latLng(22.55534,88.35025),L.latLng(22.6230,88.4502),L.latLng(22.54079,88.39622),
		L.latLng(22.76019,88.37064)
	  ],
	  show : false,
	  routeWhileDragging: true,
		fitSelectedRoutes: false
	}).on('routesfound', function (e) {
				var routes = e.routes;
				e.routes[0].coordinates.forEach(function (coord, index) {
					setTimeout(function () {
						car.setLatLng([coord.lat, coord.lng]);
					}, 5 * index)
				});
		});
	return route;
}

// Flight to Kolkta route
var line = L.polyline([[26.105, 91.589],[22.6424,88.43937]]);
var delay_flight = L.polyline([[26.105, 91.589],[22.6424,88.43937],[26.105, 91.589],[22.6424,88.43937]]);

var frmGHY = L.icon({
	iconUrl: 'Utilities/plane_from_ghy.png',
	iconSize: [25, 25]
});
var toGHY = L.icon({
	iconUrl: 'Utilities/plane_to_ghy.png',
	iconSize: [25, 25]
});

var flight_to_Kol = L.motion.polyline([[26.105, 91.589],[22.6566,88.4467]], {
			color: "transparent"
		}, {
			pause : 45000,
			auto: true,
			duration: 11000,
			easing: L.Motion.Ease.easeInOutQuart
		}, {
			removeOnEnd: true,
			showMarker: true,
			icon: frmGHY
		});

// Flight to GHY route

var flight_to_GHY = L.motion.polyline([[22.6424,88.43937],[26.105, 91.589]], {
			color: "transparent"
		}, {
			pause : 45000,
			auto: true,
			duration: 11000,
			easing: L.Motion.Ease.easeInOutQuart
		}, {
			removeOnEnd: true,
			showMarker: true,
			icon: toGHY 
		});



var routes = [ShlToGhy(),flight_to_Kol,pandal(),hangout(),flight_to_GHY];
var road;

var carIcon = L.icon({
			iconUrl: 'Utilities/car.png',
			iconSize: [20, 20]
		});
var car = L.marker([0,0],{icon : carIcon});
// Hangout spots overview
var hang_spots = L.layerGroup([L.popup().setContent('<b>City Centre 2</b><br><img src="Utilities/cc2.gif" height="150px" width="150px"/>').setLatLng([22.6230,88.4502]),
	L.popup().setContent('<b>Science City</b><br><img src="Utilities/science city.gif" height="100px" width="150px"/>').setLatLng([22.54079,88.39622])]);

// *****************************************************************************************************************************************
// START OF FUNCTIONALITIES*************************************************************************************************************************
// *****************************************************************************************************************************************

//---------------------------------------------------------------------------------------------------------------------------------------------------------
// position functions

function add_i(){
	i=i+1;
	
	map.removeLayer(marker);
	map.removeLayer(poi);
	map.removeLayer(popup);
	onClick2();
	
}

function subtract_i(){
	i=i-1;
	
	map.removeLayer(marker);
	map.removeLayer(poi);
	map.removeLayer(popup);
	onClick2();
	
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
// main button functions 

function onClick2(){
	poi = L.marker([marker_lat_longs[i][0],marker_lat_longs[i][1]],8);
	map.flyTo(poi.getLatLng(),17);
	
	poi.addTo(map);
	poi.on('mouseover', onClick);
}

function onClick() {
	if (i==4){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_route()"><span>Start Ride</span></button></center>'
		)
		.openPopup();
	}
	else if (i==5){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_route()"><span>Take off</span></button></center>'
		)
		.openPopup();
	}
	else if (i==7){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_route()"><span>Pandal hopping</span></button></center>'
		)
		.openPopup();
	}
	else if (i==12){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_route()"><span>Hangout</span></button></center>'
		)
		.openPopup();
	}
	else if (i==14){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_route()"><span>Fly back</span></button></center>'
		)
		.openPopup();
	}
	else if (i==17){
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "alert_message()">End Story</button></center>'
		)
		.openPopup();
	}
	else{
		poi.bindPopup(texts[i] + '<br>'+ images[i] +
		'<br><center><button id="next" onclick = "add_i()"><span>Next</span></buton></center>'
		)
		.openPopup();
	}    
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
// route adding functions

function add_route(){
	if (i==4){
		map.flyTo([25.885,91.779],9.5);
		road = routes[0];
		map.removeLayer(poi);
		map.removeLayer(popup);
		road.addTo(map);
		car.addTo(map);

		marker = L.marker(L.latLng(26.105, 91.589));
		marker.bindPopup(cpop(),customOptions).on('mouseover',msover).addTo(map);
	}
	else if (i==5){
		map.flyTo([25.04,90.27],6);
		road = routes[1];
		map.removeLayer(poi);
		map.removeLayer(popup);
		road.addTo(map);
		poi = L.marker(poi.getLatLng()).addTo(map);
		
		marker = L.marker(L.latLng(22.6424,88.43937));
		marker.bindPopup(cpop(),customOptions).on('mouseover',msover).addTo(map);
	}
	else if (i==7){
		i=i+1;
		map.flyTo([22.517,88.36],15);
		road = routes[2];
		map.removeLayer(poi);
		map.removeLayer(popup);
		road.addTo(map);
		car.addTo(map);
		
		marker = L.marker(L.latLng(22.51649,88.34594));
		marker.bindPopup(cpop(),customOptions).on('mouseover',msover).addTo(map);
	}
	else if (i==12){
		i=i+1;
		map.flyTo([22.6517,88.36],11);
		road = routes[3];
		map.removeLayer(poi);
		map.removeLayer(popup);
		hang_spots.addTo(map);
		road.addTo(map);
		car.addTo(map);
		
		marker = L.marker(L.latLng(22.76019,88.37064));
		marker.bindPopup(cpop(),customOptions).on('mouseover',msover).addTo(map);
	}
	else if (i==14){
		i=i+1;
		map.flyTo([25.04,90.27],6);
		road = routes[4];
		map.removeLayer(poi);
		map.removeLayer(popup);
		road.addTo(map);
		poi = L.marker(poi.getLatLng()).addTo(map);
		
		marker = L.marker(L.latLng(26.105, 91.589));
		marker.bindPopup(cpop(),customOptions).on('mouseover',msover).addTo(map);
	}
	
}

function msover(){
	marker.openPopup();
}

function del_route(){
	road.remove();
	map.removeLayer(car);
	hang_spots.remove();
	add_i();
}

function alert_message() {
  alert("COME OUTSIDE HOSTEL GATE!!");
}

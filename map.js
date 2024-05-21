// create baselayers
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'});

var Googlesat = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: 'Imagery © <a href="http://maps.google.com">Google</a>',
        maxZoom: 25,
        id: 'map' 
    });

var map = L.map('map', {
    center: [0.054869400886781154, 35.74117467176327],
    zoom: 17,
    layers: [osmHOT]
});

var baseMaps = {
    "OpenStreetMap": osm,
    "HOTOSM": osmHOT,
    "Google Satellite": Googlesat
};

// Add layer control
var layerControl = L.control.layers(baseMaps).addTo(map);

// Add CHEWASCO marker
var marker = L.marker([0.054869400886781154, 35.74117467176327]).addTo(map);
marker.bindPopup("<div class='custom-popup'><p>Welcome to</p><br><b>CHEWASCO.</b></div>").openPopup();
// Add click event to the marker to zoom 
marker.on('click', function() {
    map.setView(marker.getLatLng(), 17); 
});

// Load water points data
// load points data
var waterPoints = L.geoJson(points, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            color: 'blue',
            weight: 1,
            fillColor: 'cyan',
            fillOpacity: .8,
            radius: 6
        });
     },
     onEachFeature: function(feature, layer) {
        layer.addEventListener("mouseover", highlight_feature);
        layer.addEventListener("mouseout", reset_highlight);
        layer.addEventListener("click", zoomToFeature );
    }  
  }).addTo(map);

// Calculate the bounds of the GeoJSON data
var bounds = waterPoints.getBounds();

// Specify the maximum zoom level
var maxZoomLevel = 17; // Change this value to your desired maximum zoom level

// Zoom the map to the bounds of the GeoJSON data with the specified maximum zoom level
map.fitBounds(bounds, { maxZoom: maxZoomLevel });

// function to zoom to clicked features
function zoomToFeature(e) {
    var layer = e.target;
    map.setView(layer.getLatLng(), 21); 
    map.addLayer(Googlesat);
}

// function to reset highlight on clicked features
function reset_highlight(e) {
    waterPoints.resetStyle(e.target);
    }
    

// Add information box
let info = L.control({position: "bottomleft"});
info.onAdd = function() {
let div = L.DomUtil.create("div", "info");
div.innerHTML = '<h4>Water Point Type</h4><p id="current_feature"></p>';
return div;
};
info.addTo(map);

// Access data properties
let info_p = document.getElementById("current_feature");

function highlight_feature(e) {
e.target.setStyle({weight: 3, color: "red", fillOpacity: 0.5});
e.target.bringToFront();
info_p.innerHTML =
"Point ID: " + e.target.feature.properties.DNPOINT_ID + "<br>" +
"Water Point Type:" + e.target.feature.properties.DNPTTYPETX;
}

function reset_highlight(e) {
    waterPoints.resetStyle(e.target);
    info_p.innerHTML = "";
    }
// Create a custom control for resetting the zoom
var resetZoomControl = L.Control.extend({
        options: {
                position: 'bottomright' // Position of the control
            },
        onAdd: function (map) {
                var container = L.DomUtil.create('div', 'reset-zoom-btn');
                container.innerHTML = 'Reset Zoom';
                container.onclick = function () {
                    map.fitBounds(bounds, { maxZoom: maxZoomLevel });
                    map.removeLayer(Googlesat);
                    map.addLayer(osmHOT);
                };
                return container;
            },
        
        });

// Add the custom control to the map
map.addControl(new resetZoomControl());    

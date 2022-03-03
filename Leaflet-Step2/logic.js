function getColor(magnitude) {
    return  magnitude > 5  ? '#ee6c6e' :
            magnitude > 4  ? '#eea770' :
            magnitude > 3  ? '#f2b957' :
            magnitude > 2  ? '#f2db5a' :
            magnitude > 1  ? '#e2f15b' :
                             '#b8f15a' ;
}

function createFeatures(earthquakeData, plateData) {

    //def a function to run for each markers in the markers array
    //give markers a popup to describe place and time of quake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3>Magnitude: <strong>" + feature.properties.mag + "</strong><hr><p>" 
        + new Date(feature.properties.time) + "</p>");
    }
    //create geoJSON layer containg markers array on quakesData object
    //run on EachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getColor(feature.properties.mag),
                fillOpacity: 1.0,
                weight: 1,
                color: "black"
            });
        },
        onEachFeature: onEachFeature
    });

    //create a geoJSON layer for the plateData object
    const plates = L.geoJSON(plateData, {
        color: "dodgerblue"
    });

    //send the eathquake and plate data to createMap function
    createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

    //create tileLayers
    const satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-streets-v11',
        accessToken: API_KEY
    });

    const grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    const outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    //create baseMaps to hold base layers
    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Streetmap": outdoors
    };

    //create overlay obj to hold overlay laer
    const overlayMaps = {
        Earthquakes: earthquakes,
        Plates: plates
    };

    //create map, with satellite and eathquake layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [satellite, plates, earthquakes]
    });

    //create layer control
    //add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //keep the earthquake layer on top at all time when clicked
    myMap.on("overlayadd", function (event) {
        earthquakes.bringToFront();
    });

    //add legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function (myMap) {
        let div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Magnitude</strong>'],
        mag_categories = ['0-1','1-2','2-3','3-4','4-5','5+'];
        mag_categories_color = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]

        for (let i = 0; i < mag_categories.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i style="background:' + getColor(mag_categories_color[i]) + '"></i> ' +
            (mag_categories[i] ? mag_categories[i] : '+'));
        }
        div.innerHTML = labels.join('<br>');
        
        return div;
    };
    legend.addTo(myMap);

}

(async function(){
    const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    const earthquakeData = await d3.json(queryUrl);

    const plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
    const plateData = await d3.json(plateUrl);


    createFeatures(earthquakeData.features, plateData.features);
})()
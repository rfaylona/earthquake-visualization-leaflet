function getColor(magnitude) {
    return  magnitude > 5  ? '#ee6c6e' :
            magnitude > 4  ? '#eea770' :
            magnitude > 3  ? '#f2b957' :
            magnitude > 2  ? '#f2db5a' :
            magnitude > 1  ? '#e2f15b' :
                             '#b8f15a' ;
}

function createFeatures(earthquakeData, plateData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3>Magnitude: <strong>" + feature.properties.mag + "</strong><hr><p>" 
        + new Date(feature.properties.time) + "</p>");
    }

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

    const plates = L.geoJSON(plateData, {
        color: "dodgerblue"
    });

    createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

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

    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Streetmap": outdoors
    };

    const overlayMaps = {
        Earthquakes: earthquakes,
        Plates: plates
    };

    const myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [satellite, plates, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    myMap.on("overlayadd", function (event) {
        earthquakes.bringToFront();
    });


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
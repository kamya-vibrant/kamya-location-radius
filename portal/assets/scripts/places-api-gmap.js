var params = new URLSearchParams(window.location.search.slice(1)); 
var locationId = params.get('id');

let map;
let marker;
let circle;
let addressValue;
let latn;
let longn;
let defaultLocation;

if(locationId == null || locationId == undefined || locationId == ''){
    function initMap() {
        defaultLocation = { lat: -33.8688, lng: 151.2093 };
        map = new google.maps.Map(document.getElementById('mapLoad'), {
            center: defaultLocation,
            zoom: 10
        });

        marker = new google.maps.Marker({
            map: map,
            draggable: true
        });

        circle = new google.maps.Circle({
            map: map,
            radius: 5000, // Default to 5 km
            fillColor: '#AA0000',
            strokeColor: '#AA0000',
            fillOpacity: 0.2,
            strokeOpacity: 0.8,
        });

        circle.bindTo('center', marker, 'position');
        const input = document.getElementById('location_address');
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                alert("No details available for the input: '" + place.name + "'");
                return;
            }
            map.setCenter(place.geometry.location);
            marker.setPosition(place.geometry.location);
            map.setZoom(10);
            updateRadius();
        });

        google.maps.event.addListener(marker, 'dragend', function () {
            updateRadius();
        });
    }
} else {
    let dynamicAddress, dynamicRadius;
    setTimeout(function(){
        LocationGetNew();
        async function LocationGetNew() {
            id = locationId;
            let parameter = {
                model: 'location',
                action: 'retrieve',
                retrieve: '*',
                condition: [
                    ["id", "=", id]
                ]
            }
            try {
                var response = await sendhttpRequest(parameter);
                infoLocation = response.data;
                var locationValue = infoLocation[0].location_address;

                dynamicAddress = infoLocation[0].location_address;
                dynamicRadius = infoLocation[0].delivery_radius;
                editLocation(dynamicAddress, dynamicRadius);
                initMapUpdate(dynamicAddress, dynamicRadius);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
    }, 3000);

    function initMapUpdate(dynamicAddress, dynamicRadius) {
        const defaultPosition = { lat: 37.4219999, lng: -122.0840575 }; // Default location
        map = new google.maps.Map(document.getElementById("mapLoad"), {
            center: defaultPosition,
            zoom: 12
        });

        const input = document.getElementById("location_address");
        const autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            const location = place.geometry.location;
            updateMarkerAndCircle(location, parseFloat(document.getElementById("delivery_radius").value) || dynamicRadius);
        });
    }

    function editLocation() {
        geocodeAddress(dynamicAddress, (location) => {
            map.setCenter(location);
            updateMarkerAndCircle(location, dynamicRadius);
        });
    }

    function updateMarkerAndCircle(location, radiusKm) {
        if (marker) marker.setMap(null);
        marker = new google.maps.Marker({
            position: location,
            map: map
        });

        if (circle) circle.setMap(null); // Remove existing circle if present
        circle = new google.maps.Circle({
            map: map,
            radius: radiusKm * 1000, // Convert km to meters
            center: location,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2
        });

        map.fitBounds(circle.getBounds()); // Adjust map zoom to fit radius
    }

    function geocodeAddress(address, callback) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0]) {
                callback(results[0].geometry.location);
            } else {
                alert("Geocode failed: " + status);
            }
        });
    }

    window.onload = initMapUpdate;
}


function updateRadius() {
    const radiusKm = parseFloat(document.getElementById('delivery_radius').value);
    const radiusMeters = radiusKm * 1000;
    circle.setRadius(radiusMeters);
}

function updateMap() {
    const radiusKm = parseFloat(document.getElementById('delivery_radius').value);
    if (!isNaN(radiusKm)) {
        updateRadius();
    } else {
        alert("Please enter a valid radius.");
    }
}
window.onload = initMap;
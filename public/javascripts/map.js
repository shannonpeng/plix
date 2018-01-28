var map, infoWindow;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.354778, lng: -71.101988},
    zoom: 6,
    zoomControl: false,
    scaleControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    });
    
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        var my_circle = new google.maps.Circle({
            strokeColor: '#FFBB2B',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FFDD4A',
            fillOpacity: 0.35,
            map: map,
            center: pos,
            radius: 64
          });

        var my_marker = new google.maps.Circle({
            strokeColor: 'white',
            strokeOpacity: 1,
            strokeWeight: 4,
            fillColor: '#69BBF3',
            fillOpacity: 1,
            map: map,
            center: pos,
            zIndex: 99,
            radius: 4
          });

        map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
        map.setZoom(18);
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

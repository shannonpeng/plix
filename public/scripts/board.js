function load(src, callback) {
    var script = document.createElement('script');
    var loaded = false;
    script.setAttribute('src', src);
    if (callback) {
      script.onreadystatechange = script.onload = function() {
        if (!loaded) { callback(); }
        loaded = true;
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
}

function pixPick(x, y){
    // Post new pixel to database
    var hex = document.getElementById('pixcolor').value;

    $.ajax({
        type: "POST",
        url: "board?" + board,
        data: {
          x: x,
          y: y,
          hex: hex
        },
        success: function(data) {
          console.log('yay');
        },
        error: function(data) {
          console.log('error: ' + data);
        }
    });

    // Emit new pixel via socket
    var pixel = new Object();
    pixel.x = x;
    pixel.y = y;
    pixel.hex = document.getElementById('pixcolor').value;
    socket.emit('new-pixel', { pixel: pixel });
}

// Connect to socket
var socket = io();
var board = $("#view-board").attr("board");
var sidebarOpen = true; // map takes care of the first open

$(document).ready(function() {
    // Join board
    socket.on('connect', function() {
        socket.emit('room', board);
    })
    // Receive new pixel and update board
    socket.on('new-pixel', function(data){
        console.log('pixel received!');
        $("#" + data.pixel.x + "-" + data.pixel.y).css("background-color", data.pixel.hex);
    });
});

// Color picker
$('#pixcolor').on('input', function (evt) {
    var color = document.getElementById('pixcolor').value;
    var overlays = document.getElementsByClassName('overlay');

    for (overlay of overlays) {
        overlay.style.backgroundColor = color;
    }
});

// Color picker
$('.back-arrow').on('click', function (evt) {
    if (sidebarOpen) {
        $("#board-sidebar").removeClass("active");
        $(".back-arrow i").removeClass("fa-arrow-left");
        $(".back-arrow i").addClass("fa-arrow-right");
        sidebarOpen = false;
    }
    else {
        $("#board-sidebar").addClass("active");
        $(".back-arrow i").removeClass("fa-arrow-right");
        $(".back-arrow i").addClass("fa-arrow-left");
        sidebarOpen = true;
    }
});

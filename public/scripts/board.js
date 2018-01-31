var board = $("#view-board").attr("board"); // get board ID

// Connect to socket
var socket = io();
$(document).ready(function() {
    // Join board
    socket.on('connect', function() {
        var d = getDistance(pos, b.target);
        if (d <= b.radius) {
            socket.emit('room', board);
        }
    })
    // Receive new pixel and update board
    socket.on('new-pixel', function(data){
        //console.log('pixel received!');
        $("#" + data.pixel.x + "-" + data.pixel.y).css("background-color", data.pixel.hex);
    });
});

function pixPick(x, y){
    // Post new pixel to database
    var hex = document.getElementById('pixcolor').value;
    if ($('#paint').hasClass('show')) {
        $.ajax({
            type: "POST",
            url: "board?" + board,
            data: {
              x: x,
              y: y,
              hex: hex,
              pos: pos
            },
            success: function(data) {
              //console.log('yay');
            },
            error: function(data) {
              console.log('error');
            }
        });

        // Emit new pixel via socket
        var pixel = new Object();
        pixel.x = x;
        pixel.y = y;
        pixel.hex = document.getElementById('pixcolor').value;
        socket.emit('new-pixel', { pixel: pixel });
    }
}

// Overlay pixel
$('#pixcolor').on('change', function (evt) {
    var color = document.getElementById('pixcolor').value;
    $(".board .overlay").css("background-color", color);
});

// Show/hide sidebar on arrow click
$('.back-arrow').on('click', function (evt) {
    toggleSidebar();
});

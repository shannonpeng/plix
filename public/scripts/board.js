// Connect to socket
var socket = io();

$(document).ready(function() {
    // Receive new pixel and update board
    socket.on('new-pixel', function(data){
        $("#" + data.pixel.x + "-" + data.pixel.y).css("background-color", data.pixel.hex);
    });
});

function pixPick(x, y){
    console.log(x, y);

    // Post new pixel to database
    var form = document.getElementById('paint');
    form.setAttribute('method', 'POST');

    var x_in = document.createElement("input");
    x_in.setAttribute("type", "hidden");
    x_in.setAttribute("name", "x");
    x_in.setAttribute("value", x);
    form.appendChild(x_in);

    var y_in = document.createElement("input");
    y_in.setAttribute("type", "hidden");
    y_in.setAttribute("name", "y");
    y_in.setAttribute("value", y);
    form.appendChild(y_in);

    form.submit();

    // Emit new pixel via socket
    var pixel = new Object();
    pixel.x = x;
    pixel.y = y;
    pixel.hex = document.getElementById('pixcolor').value;
    socket.emit('new-pixel', { pixel: pixel });
}

// Color picker
$('#pixcolor').on('input', function (evt) {
    var color = document.getElementById('pixcolor').value;
    var overlays = document.getElementsByClassName('overlay');

    for (overlay of overlays) {
        overlay.style.backgroundColor = color;
    }
});

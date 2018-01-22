function pixPick(x, y){
    console.log(x, y);

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

    console.log(form);

    form.submit();

    //send post request; but res.render over return redirect (index.js)
}

document.getElementById('pixcolor').addEventListener('input', function (evt) {
    var color = document.getElementById('pixcolor').value;
    var overlays = document.getElementsByClassName('overlay');

    for (overlay of overlays) {
        overlay.style.backgroundColor = color;
    }
});

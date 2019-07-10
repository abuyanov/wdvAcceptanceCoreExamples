$(function () {
    const tooltip = new (function () {
        const node = document.createElement('div');
        node.className = 'tooltip';
        node.setAttribute('hidden', '');
        document.body.appendChild(node);

        this.follow = function (event) {
            node.style.left = event.clientX + 20 + 'px';
            node.style.top = event.clientY + 10 + 'px';
        };

        this.show = function (event) {
            node.textContent = event.target.dataset.tooltip;
            node.removeAttribute('hidden');
        };

        this.hide = function () {
            node.setAttribute('hidden', '');
        };
    })();

    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.onmouseover = tooltip.show;
        link.onmousemove = tooltip.follow;
        link.onmouseout = tooltip.hide;
    });


    window.addEventListener('orientationchange', doOnOrientationChange);
    window.onresize = resize;

    function depress() {
        toast.classList.add('depressed');
    }

    function release() {
        toast.classList.remove('depressed');
    }

    const toaster = document.querySelector('.toaster');
    const toast = document.querySelector('.toast');

    toaster.onmousedown = depress;
    document.onmouseup = release;

    document.addEventListener("drag", function (event) {
        document.getElementById("versionInfo").style.color = "red";
    });

    document.addEventListener("dragend", function (event) {
        document.getElementById("versionInfo").style.color = "black";
    });

});

function doOnOrientationChange() {
    switch (window.orientation) {
        case -90 || 90:
            alert('landscape');
            break;
        default:
            alert('portrait');
            break;
    }
}

function resize() {
    document.getElementById('rheight').textContent = window.innerHeight;
    document.getElementById('rwidth').textContent = window.innerWidth;
}
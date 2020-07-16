var counter = new Counter(...papieztime)

counter.addEvent('tick', function(data) {
    display.textContent = counter.active ? `${data.format.s}` : `${data.format.h}:${data.format.m}:${data.format.s}`
})

window.onload = function() {
    display = document.querySelector('#display')
}
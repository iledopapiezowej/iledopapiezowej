var start = new Date,
    isPapiezowa = false,
    punkty = 0

start.setHours(14, 36, 0)

function pad(num) {
    return ("0" + parseInt(num)).substr(-2);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function papiezowa() {
    if (isPapiezowa) return
    isPapiezowa = true

    barka.play()
    barka.style.bottom = '5%'
    clock.style.fontSize = '12vh'
    display.style.fontSize = '3vh'
    document.body.classList.add("rainbow");
}

function popapiezowej() {
    if (!isPapiezowa) return
    isPapiezowa = false

    barka.pause()
    barka.style.bottom = '-25vh'
    clock.style.fontSize = '5vh'
    display.style.fontSize = '10vh'
    document.body.classList.remove("rainbow");
}

function popup() {
    var lr = (rand(-1, 1) || 1),
        side = lr == 1 ? 'left' : 'right'

    minipapiez.style.transitionProperty = ''
    minipapiez.style.transform = `scale(${lr}, 1)`
    minipapiez.style.left = ''
    minipapiez.style.right = ''
    minipapiez.style[side] = '-5vh'
    minipapiez.style.transitionProperty = side
    minipapiez.style[side] = '3vh'
    minipapiez.addEventListener('transitionend', function() {
        minipapiez.style[side] = '-5vh'
    }, false)
}

function clicker() {

}

window.onload = function() {
    display = document.querySelector('#display')
    clock = document.querySelector('#clock')
    barka = document.querySelector('#barka')
    points = document.querySelector('#points')
    papiez = document.querySelector('#papiez')
    minipapiez = document.querySelector('#minipapiez')

    papiez.onmousedown = function() {
        punkty++
        points.textContent = punkty
    }

    setInterval(() => {
        var now = new Date
        if (now > start) start.setDate(start.getDate() + 1)

        var remain = ((start - now) / 1000)
        var hh = pad((remain / 60 / 60) % 60)
        var mm = pad((remain / 60) % 60)
        var ss = pad(remain % 60)

        clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
        display.textContent = isPapiezowa ? `${ss}` : `${hh}:${mm}:${ss}`

        if (remain > 86340) papiezowa()
        else popapiezowej()

    }, 100);
}
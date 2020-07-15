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

    minipapiez.style.left = `${rand(5, 95)}vw`
    minipapiez.style.top = `${rand(5, 95)}vh`
    minipapiez.style.transform = `scale(${rand(-1, 1) || 1}, ${rand(-1, 1) || 1})`
    minipapiez.style.opacity = `1`
    var hide = setTimeout(() => { minipapiez.style.opacity = `0` }, 2000)
    console.log('popup')

    minipapiez.addEventListener('click', function() {
        if (minipapiez.style.opacity < .8) return
        clearTimeout(hide)
        minipapiez.style.opacity = `0`
        if (isDuzy) points += perCatch
        else startClicker()
    }, false)
}

function startClicker() {
    isDuzy = true
    time = performance.now()
    papiez.classList.remove('hideBottom')
    bar.classList.remove('hideTop')
}

function onClicker() {
    health--
    if (health <= 0) stopClicker()
    progress.style.width = `${health}%`
}

function stopClicker() {
    isDuzy = false
    papiez.style.top = '100vh'
    bar.style.top = '-5vh'
    Storage.Session.set('wynik', {
        time: performance.now() - time,
        points: points
    })
    location.pathname = 'wynik.html'
}

window.onload = function() {
    display = document.querySelector('#display')
    clock = document.querySelector('#clock')
    barka = document.querySelector('#barka')
    papiez = document.querySelector('#papiez')
    minipapiez = document.querySelector('#minipapiez')
    bar = document.querySelector('#progressbar')
    progress = document.querySelector('#progressbar>div')
    ver = document.querySelector('#ver')

    papiez.onmousedown = onClicker

    setInterval(() => {
        var r = rand(0, 6 / isPapiezowa ? chanceMultiplier : 1)
        if (r || (health <= 0)) return
        popup()
    }, 2137)

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

    if (VERSION.endsWith('dev')) ver.classList.add('dev')
    else ver.classList.add('stable')
    ver.textContent = VERSION
}
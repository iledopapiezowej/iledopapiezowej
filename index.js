function papiezowa() {
    barka.play()
    document.body.classList.add('papiezowa')
    clock.classList.add('papiezowa')
    display.classList.add('papiezowa')
    views.classList.add('papiezowa')
    barka.classList.remove('hideBottom')
    minigame._settings.chance = 5
}

function popapiezowej() {
    barka.pause()
    document.body.classList.remove('papiezowa')
    clock.classList.remove('papiezowa')
    display.classList.remove('papiezowa')
    views.classList.remove('papiezowa')
    barka.classList.add('hideBottom')
    minigame._settings.chance = 1
}

const minigame = {
    _timeout: undefined,
    _active: false,
    _health: 100,
    _points: 0,
    _time: undefined,
    _settings: {
        perClick: 1,
        perCatch: 250,
        chance: 1
    },
    _randomize() {
        var lr = (rand(-1, 1) || 1),
            side = lr == 1 ? 'left' : 'right'
        minipapiez.style.left = `${rand(5, 95)}vw`
        minipapiez.style.top = `${rand(5, 95)}vh`
        minipapiez.style.transform = `scale(${rand(-1, 1) || 1}, ${rand(-1, 1) || 1})`
    },
    tick() {
        var r = rand(0, 10 / this._settings.chance)
        if (r || (this._health <= 0)) return
        this._popup()
    },
    _show() {
        clearTimeout(this._timeout)
        minipapiez.classList.add('popup')
    },
    _hide() {
        minipapiez.classList.remove('popup')
    },
    _popup() {
        console.log('popup')
        this._randomize()
        this._show()
        this._timeout = setTimeout(this._hide, 2000)
    },
    catch () {
        if (minipapiez.className != 'popup') return
        clearTimeout(this._timeout)
        this._hide()
        if (this._active) this._points += this._settings.perCatch
        else this._start()
    },
    _start() {
        this._active = true
        this._time = performance.now()
        papiez.classList.remove('hideBottom')
        bar.classList.remove('hideTop')
    },
    click() {
        this._health -= this._settings.perClick
        if (this._health <= 0) this._end()
        progress.style.width = `${this._health}%`
    },
    _end() {
        this._active = false
        papiez.classList.add('hideBottom')
        bar.classList.add('hideTop')
        Storage.Session.set('wynik', {
            time: performance.now() - this._time,
            points: this._points,
            catches: this._points / this._settings.perCatch
        })
        location.pathname = 'wynik.html'
    }
}

// papieżowa
var counter = new Counter(21, 37, 0)

counter.addEvent('tick', function(data) {
    clock.textContent = `${pad(data.now.getHours())}:${pad(data.now.getMinutes())}`
    display.textContent = counter.active ? `${data.format.s}` : `${data.format.h}:${data.format.m}:${data.format.s}`
})
counter.addEvent('on', data => papiezowa(data))
counter.addEvent('off', data => popapiezowej(data))

// minigame
setInterval(function() { minigame.tick() }, 3e3)

window.onload = function() {
    display = document.querySelector('#display')
    clock = document.querySelector('#clock')
    barka = document.querySelector('#barka')
    papiez = document.querySelector('#papiez')
    minipapiez = document.querySelector('#minipapiez')
    bar = document.querySelector('#progressbar')
    progress = document.querySelector('#progressbar>div')
    ver = document.querySelector('#ver')
    viewcount = document.querySelector('#viewcount')

    papiez.onmousedown = function() { minigame.click() }

    minipapiez.addEventListener('click', function() { minigame.catch() }, false)

    // live updater
    function update() {
        if (document.visibilityState == 'hidden') return
        postData(`/api/live/update/${uuid}`).then(data => {
            viewcount.textContent = data.counter
        });
    }

    update()
    setInterval(update, liveInterval)

    ver.textContent = VERSION
}
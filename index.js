function papiezowa() {
    // if (isPapiezowa) return
    // isPapiezowa = true

    barka.play()
        // barka.style.bottom = '5%'
        // clock.style.fontSize = '12vh'
        // display.style.fontSize = '3vh'
        // document.body.classList.add("rainbow");
    document.body.classList.add('papiezowa')
    clock.classList.add('papiezowa')
    display.classList.add('papiezowa')
    views.classList.add('papiezowa')
    barka.classList.remove('hideBottom')
}

function popapiezowej() {
    // if (!isPapiezowa) return
    // isPapiezowa = false

    barka.pause()
    document.body.classList.remove('papiezowa')
    clock.classList.remove('papiezowa')
    display.classList.remove('papiezowa')
    views.classList.remove('papiezowa')
    barka.classList.add('hideBottom')
        // barka.style.bottom = '-25vh'
        // clock.style.fontSize = '5vh'
        // display.style.fontSize = '10vh'
        // document.body.classList.remove("rainbow");
}

const minigame = {
    _timeout: undefined,
    _randomize() {
        var lr = (rand(-1, 1) || 1),
            side = lr == 1 ? 'left' : 'right'
        minipapiez.style.left = `${rand(5, 95)}vw`
        minipapiez.style.top = `${rand(5, 95)}vh`
        minipapiez.style.transform = `scale(${rand(-1, 1) || 1}, ${rand(-1, 1) || 1})`
    },
    _show() {
        clearTimeout(this._timeout)
        minipapiez.classList.add('popup')
    },
    _hide() {
        minipapiez.classList.remove('popup')
    },
    popup() {
        console.log('popup')
        this._randomize()
        this._show()
        this._timeout = setTimeout(this._hide, 2000)
    },
    catch () {
        if (minipapiez.className != 'popup') return
        clearTimeout(this._timeout)
        this._hide()
        if (isDuzy) points += perCatch
        else this._start()
    },
    _start() {
        isDuzy = true
        time = performance.now()
        papiez.classList.remove('hideBottom')
        bar.classList.remove('hideTop')
    },
    click() {
        health--
        if (health <= 0) this._end()
        progress.style.width = `${health}%`
    },
    _end() {
        isDuzy = false
        papiez.classList.add('hideBottom')
        bar.classList.add('hideTop')
        Storage.Session.set('wynik', {
            time: performance.now() - time,
            points: points
        })
        location.pathname = 'wynik.html'
    }
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
    viewcount = document.querySelector('#viewcount')

    papiez.onmousedown = function() { minigame.click() }

    minipapiez.addEventListener('click', function() { minigame.catch() }, false)

    // papieżowa
    var counter = new Counter(11, 43, 45)

    counter.addEvent('tick', function(data) {
        clock.textContent = `${pad(data.now.getHours())}:${pad(data.now.getMinutes())}`
        display.textContent = counter.active ? `${data.format.s}` : `${data.format.h}:${data.format.m}:${data.format.s}`
    })
    counter.addEvent('on', data => papiezowa(data))
    counter.addEvent('off', data => popapiezowej(data))

    // minigame
    setInterval(() => {
        var r = rand(0, 6 / (counter.active ? chanceMultiplier : 1))
        if (r || (health <= 0)) return
        minigame.popup()
    }, 1e3)

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
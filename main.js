const VERSION = 'v1.14'

var goal = new Date,
    isPapiezowa = false,
    Elements = {
        display: undefined,
        clock: undefined,
        audio: undefined,
        ver: undefined
    }

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function papiezowa() {
    Elements.audio.play()
    Elements.audio.style.bottom = '5%'
    Elements.clock.style.fontSize = '12vh'
    Elements.display.style.fontSize = '3vh'
    document.body.classList.add("rainbow");
}

function popapiezowej() {
    Elements.audio.pause()
    Elements.audio.style.bottom = '-25vh'
    Elements.clock.style.fontSize = '5vh'
    Elements.display.style.fontSize = '10vh'
    document.body.classList.remove("rainbow");
}

window.onload = function() {

    goal.setHours(21, 37, 0)

    Elements = {
        display: document.querySelector('#display'),
        clock: document.querySelector('#clock'),
        audio: document.querySelector('#audio'),
        ver: document.querySelector('#ver')
    }

    Elements.audio.volume = 0.5

    // Elements.clock tick, goal detection
    setInterval(() => {
        var now = new Date
        pad = x => ("0" + parseInt(x)).substr(-2)

        if (now > goal) goal.setDate(goal.getDate() + 1)

        var remain = ((goal - now) / 1000),
            h = pad((remain / 60 / 60) % 60),
            m = pad((remain / 60) % 60),
            s = pad(remain % 60)

        Elements.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
        Elements.display.textContent = isPapiezowa ? `${s}` : `${h}:${m}:${s}`

        if (remain > 86340) {
            if (isPapiezowa) return
            isPapiezowa = true
            papiezowa()
        } else {
            if (!isPapiezowa) return
            isPapiezowa = false
            popapiezowej()
        }

    }, 100);

    // add 'dev' marker
    if (VERSION.endsWith('dev')) ver.classList.add('dev')
    else Elements.ver.classList.add('stable')
    Elements.ver.textContent = VERSION
}
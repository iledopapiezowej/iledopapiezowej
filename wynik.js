var counter = new Counter(...papieztime)

sent = Storage.Session.get('sent') ? Storage.Session.get('uuid') : false

counter.addEvent('tick', function(data) {
    display.textContent = counter.active ? `${data.format.s}` : `${data.format.h}:${data.format.m}:${data.format.s}`
})

window.onload = function() {
    display = document.querySelector('#display')
    punkty = document.querySelector('#punkty')
    info1 = document.querySelector('#info1')
    info2 = document.querySelector('#info2')
    info3 = document.querySelector('#info3')
    scoreboard = document.querySelector('#scoreboard')
    nick = document.querySelector('#nickname')
    submit = document.querySelector('#submit')

    wynik = Storage.Session.get('wynik')
    score = ((15e6 / wynik.time) + wynik.points)

    punkty.textContent = `${score.toFixed(2)} punktów`

    submit.onclick = function save() {
        if (sent) return
        postData('/api/scoreboard/save', {
            nick: nick.value,
            time: wynik.time,
            points: wynik.points,
            score: score,
            uuid: uuid,
        }).catch(e => {
            console.log('save error')
        })
        var current = document.createElement('span')
        current.textContent = `${nick.value.toUpperCase()} - ${score.toFixed(2)}`
        current.style.fontFamily = 'monospace'
        current.style.fontSize = '2rem'
        nick.parentNode.appendChild(current)
        nick.remove()
        submit.remove()
    }

    getData('/api/scoreboard/whereami', { score: score }).then(data => {
        doneLoading(info3)
        info3.textContent = `Twój wynik jest lepszy od ${data.percentage.toFixed(2)}% graczy`
    });

    getData('/api/scoreboard/top').then(data => {
        doneLoading(scoreboard)
        var ol = document.createElement('ol')
        data.list.reduce(function(r, a) {
            var li = document.createElement('li')
            li.innerText = `${a.nick} - ${a.score.toFixed(2)}`
            ol.appendChild(li)
            return true
        }, ol)
        scoreboard.appendChild(ol)
    });

    doneLoading(info1)
    info1.textContent = `Zebrałeś ${wynik.catches} papieży`
    doneLoading(info2)
    info2.textContent = `Twój czas to ${(wynik.time / 1e3).toFixed(2)}s`

}
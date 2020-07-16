var counter = new Counter(21, 37, 0)

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

    wynik = Storage.Session.get('wynik')
    p = 15e6 / wynik.time
    p += wynik.points
    p = p.toFixed(2)
    punkty.textContent = `${p} punktów`

    getData(`/api/scoreboard/whereami`, { score: 14 }).then(data => {
        info3.textContent = `Twój wynik jest lepszy od ${data.percentage}% graczy`
    });

    getData(`/api/scoreboard/top`, { score: p }).then(data => {

        data.list.reduceRight(function(r, a) {
            var li = document.createElement('li')
            li.innerText = `${a[0]} - ${a[1]}`
            scoreboard.appendChild(li)
            return true
        }, scoreboard)

    });

    info1.textContent = `Zebrałeś ${ wynik.catches } papieży`
    info2.textContent = `Twój czas to ${(wynik.time / 1e3).toFixed(2)}s`

}
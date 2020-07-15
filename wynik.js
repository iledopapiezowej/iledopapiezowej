window.onload = function() {
    punkty = document.querySelector('#punkty')
    wynik = Storage.Session.get('wynik')
    p = 15e6 / wynik.time
    p += wynik.points
    p = p.toFixed(2)
    console.log(p)
    punkty.textContent = `${p} punktów`
}
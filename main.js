const VERSION = 'v1.15.3dev'

var Elements = {
	display: undefined,
	clock: undefined,
	audio: undefined,
	ver: undefined
},
	Papiezowa = {
		reached: false,
		goal: new Date,
		_onEvents: [],
		_offEvents: [],
		_on() {
			for (let e of this._onEvents) {
				e()
			}
		},
		_off() {
			for (let e of this._offEvents) {
				e()
			}
		},
		tick() {
			var now = new Date
			pad = x => ("0" + parseInt(x)).substr(-2)

			var remain = ((this.goal - now) / 1000),
				h = parseInt((remain / 60 / 60) % 60),
				m = parseInt((remain / 60) % 60),
				s = parseInt(remain % 60)

			if (h > 0) m = pad(m)
			if ((h > 0) || (m > 0)) s = pad(s)

			Elements.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
			Elements.display.textContent = this.reached ? `${s}` : `${h > 0 ? `${h}:${m}:${s}`: m > 0 ? `${m}:${s}` : s}`

			if (remain > 86340) {	// is goal 
				if (!this.reached) {	// is reached already?
					this.reached = true
					this._on()
				}
			} else if (this.reached) {
				this.reached = false
				this._off()
			}
			setTimeout(() => {
				this.tick()
			}, 100)
		},
		addOn(e) {
			this._onEvents.push(e)
		},
		addOff(e) {
			this._offEvents.push(e)
		}
	}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

window.onload = function () {

	Elements = {
		display: document.querySelector('#display'),
		clock: document.querySelector('#clock'),
		audio: document.querySelector('#audio'),
		ver: document.querySelector('#ver')
	}

	// default goal time
	Papiezowa.goal.setHours(0, 35, 0)
	if (new Date > Papiezowa.goal) Papiezowa.goal.setDate(Papiezowa.goal.getDate() + 1)

	// default events
	Papiezowa.addOn(function () {
		Elements.audio.play()
		Elements.audio.style.bottom = '5%'
		Elements.clock.style.fontSize = '12vh'
		Elements.display.style.fontSize = '3vh'
		document.body.classList.add("rainbow")
	})

	Papiezowa.addOff(function () {
		Elements.clock.style.fontSize = '5vh'
		Elements.display.style.fontSize = '10vh'
		document.body.classList.remove("rainbow")
	})

	// audio player settings
	Elements.audio.volume = 0.75

	Elements.audio.onpause = function () {
		if (!Papiezowa.reached) Elements.audio.style.bottom = '-25vh'
	}

	// add 'dev' marker
	if (VERSION.endsWith('dev')) ver.classList.add('dev')
	else Elements.ver.classList.add('stable')
	Elements.ver.textContent = VERSION

	// clock tick, goal detection
	Papiezowa.tick()
}
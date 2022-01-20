function addListener(name, callback) {
	if (typeof this.events !== 'object') this.events = {}
	if (!Array.isArray(this.events[name])) this.events[name] = []

	this.events[name].push(callback)
	return this.events[name].length - 1
}

function removeListener(name, i) {
	this.events[name].splice(i, 1)
}

function triggerEvent(name, payload) {
	if (typeof this.events[name] !== 'undefined')
		for (let callback of this.events[name]) {
			callback(payload, this)
		}
}

export { addListener, removeListener, triggerEvent }

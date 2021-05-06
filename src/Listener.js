export function addListener(name, callback){
    if(typeof this.events !== 'object') this.events = {}
    if(!Array.isArray(this.events[name])) this.events[name] = []

    this.events[name].push(callback)
}

export function addStateListener(name, state){
    this.addListener(name, (data) => {
        this.setState({
            [state]: data
        })
    })
}

export function triggerEvent(name, payload){
    if(typeof this.events[name] !== 'undefined')
    for(let callback of this.events[name]){
        callback(payload, this)
    }
}
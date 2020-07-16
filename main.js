const VERSION = 'v1.12'

var uuid,
    liveInterval = 4e3

var devtools = function() {};
devtools.toString = function() {
    this.opened = true;
}

console.log('%c', devtools);

class Storage {
    static get Local() {
        return {
            get(key) {
                return JSON.parse(localStorage.getItem(key))
            },
            set(key, value) {
                localStorage.setItem(key, JSON.stringify(value))
                return value
            }
        }
    }
    static get Session() {
        return {
            get(key) {
                return JSON.parse(sessionStorage.getItem(key))
            },
            set(key, value) {
                sessionStorage.setItem(key, JSON.stringify(value))
                return value
            }
        }
    }
    static get Cookie() {
        return {
            get(key) {
                var name = key + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return undefined;
            },
            set(key, value, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = key + "=" + value + ";" + expires + ";path=/";
            }
        }
    }
}

class Counter {
    constructor(hours, minutes, seconds) {
        this._goal = new Date()
        this._events = {
            on: [],
            off: [],
            tick: []
        }
        this._reached = false
        this._goal.setHours(hours, minutes, seconds)
        setInterval(() => { this._tick() }, 100)
    }

    get active() {
        return this._reached
    }

    addEvent(onoff, event) {
        switch (onoff) {
            default: throw new Error('Incorrect event name')
            case 'on':
                    this._events['on'].push(event)
                break
            case 'off':
                    this._events['off'].push(event)
                break
            case 'tick':
                    this._events['tick'].push(event)
                break
        }
    }

    _tick() {
        var now = new Date
        if (now > this._goal) this._goal.setDate(this._goal.getDate() + 1)
        var remain = ((this._goal - now) / 1000),
            data = {
                remain: remain,
                now: now,
                format: {
                    h: pad((remain / 60 / 60) % 60),
                    m: pad((remain / 60) % 60),
                    s: pad(remain % 60)
                }
            }

        if (remain > 86340) {
            if (!this._reached) {
                this._reached = true
                console.log('event: on')
                this._events['on'].forEach(e => e(data))
            }
        } else {
            if (this._reached) {
                this._reached = false
                console.log('event: off')
                this._events['off'].forEach(e => e(data))
            }
        }

        this._events['tick'].forEach(function(e) { e(data) })
    }
}

function makeID(n) {
    /**
     * Generate base64 id
     * @param {int} n output length
     * 
     * @returns {string} generated base64 string identificator
     */

    var out = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

    for (var i = 0; i < n; i++)
        out += chars.charAt(Math.floor(Math.random() * chars.length));

    return out;
}

function pad(num) {
    return ("0" + parseInt(num)).substr(-2);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    var response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

async function getData(url = '', query = {}) {
    var response = await fetch(url + '?' + new URLSearchParams(query).toString(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    });
    return response.json();
}

uuid = Storage.Local.get('uuid') ? Storage.Local.get('uuid') : Storage.Local.set('uuid', makeID(12))

if ('serviceWorker' in navigator && false) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
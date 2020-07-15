const VERSION = 'v1.12'

var start = new Date,
    isPapiezowa = false,
    isDuzy = false,
    health = 100,
    points = 0,
    perClick = 1,
    perCatch = 15,
    chanceMultiplier = 8,
    time

start.setHours(21, 37, 0)

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
                value = JSON.stringify(value)
                localStorage.setItem(key, value)
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
                value = JSON.stringify(value)
                sessionStorage.setItem(key, value)
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

function pad(num) {
    return ("0" + parseInt(num)).substr(-2);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

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
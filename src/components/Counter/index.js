import React from 'react';

import './style.css';

class Counter extends React.Component {
    static defaultProps = {
        doClock: true,
        doDisplay: true,
        goal: [21, 37, 0, 0],
        remain: Infinity,
        sync: {}
    }

    constructor(props) {
        super(props)
        this.state = {
            clock: '',
            display: ''
        }
        this.reached = false
        this.remain = Infinity
        this.goal = new Date()
        this.goal.setHours(...props.goal)
    }

    componentDidMount() {
        this.tick()
        this.interval = setInterval(() => this.tick(), 100)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    calc() {
        var now = new Date(Date.now() - (this.props.sync.offset || 0)),
            pad = x => ("0" + parseInt(x)).substr(-2)

        // now.setMilliseconds(0)
        if (now > this.goal) this.goal.setDate(this.goal.getDate() + 1)

        let remain = this.remain = Math.floor((this.goal - now) / 1000)

        var h = parseInt((remain / 60 / 60) % 60),
            m = parseInt((remain / 60) % 60),
            s = parseInt(remain % 60)

        if (h > 0) m = pad(m)
        if ((h > 0) || (m > 0)) s = pad(s)

        // console.log(
        //     `${pad(now.getHours())}:${pad(now.getMinutes())}.${(now.getMilliseconds()/100).toFixed(0)}`,
        //     ((this.goal - now) / 1000).toFixed(1)
        // )

        return [
            `${pad(now.getHours())}:${pad(now.getMinutes())}`,
            this.reached ? `${s}` : `${h > 0 ? `${h}:${m}:${s}` : m > 0 ? `${m}:${s}` : s}`,
            remain
        ]
    }

    on() {
        if (typeof this.props.onEventStart == 'function')
            this.props.onEventStart((60 - (parseInt(this.remain) - 86340)))
    }

    off() {
        if (typeof this.props.onEventEnd == 'function')
            this.props.onEventEnd()
    }

    tick() {
        let [clock, display, remain] = this.calc()

        this.setState({
            clock: clock,
            display: display
        })

        if (remain >= (24 * 60 * 60) - 60) {	// is goal 
            if (!this.reached) {	// is reached already?
                this.reached = true
                this.on()
            }
        } else if (this.reached) {
            this.reached = false
            this.off()
        }
    }

    render() {
        return (
            <div
                className={[
                    'lines',
                    this.props.doClock ? 'clock' : '',
                    this.props.doDisplay ? 'display' : ''
                ].join(' ')}
            >
                <div className="clock">{this.state.clock}</div>
                <div className="display">{this.state.display}</div>
            </div>
        )
    }
}

export default Counter;
import React from 'react'

import './style.css'
import { ReactComponent as Play } from './play.svg'
import { ReactComponent as Pause } from './pause.svg'
import { ReactComponent as VolumeFull } from './volume-full.svg'
import { ReactComponent as VolumeMiddle } from './volume-middle.svg'
import { ReactComponent as VolumeMute } from './volume-mute.svg'
import { ReactComponent as Sine } from './sine.svg'

class Player extends React.Component {
    static defaultProps = {
        event: false,
        elapsed: 0
    }

    constructor(props) {
        super(props)

        this.audio = new Audio('/media/barka.ogg')
        this.audio.onpause = ()=>{this.pause()}
        // this.audio.onplay = ()=>{this.play()}

        this.maxVolume = 8

        this.state = {
            playing: false,
            volume: 4
        }
    }

    play() {
        this.setState({
            playing: true
        })
        this.audio.play()
    }

    pause() {
        this.setState({
            playing: false
        })
        this.audio.pause()
    }

    toggle() {
        this.state.playing ? this.pause() : this.play()
    }

    volume() {
        let volume = this.state.volume - 1
        if (volume < 0) volume = this.maxVolume
        this.setState({
            volume: volume
        })
        this.audio.volume = volume / this.maxVolume
    }

    componentDidMount() {
        if (this.props.event && !this.state.playing) this.play()
    }

    componentDidUpdate(prevProps) {
        if(!prevProps.event && this.props.event){
            this.audio.currentTime = this.props.elapsed
            this.play()
        }
    }

    render() {

        let volume
        if (this.state.volume >= this.maxVolume) volume = <VolumeFull />
        if (this.state.volume < this.maxVolume) volume = <VolumeMiddle />
        if (this.state.volume <= 0) volume = <VolumeMute />

        return (
            <div className="audio" data-playing={this.state.playing}>
                <div
                    className="button playpause"
                    onClick={() => this.toggle()}
                    data-tooltip={this.state.playing ? 'Pause' : 'Play'}
                >
                    {
                        this.state.playing ? <Pause /> : <Play />
                    }
                </div>
                <div className="button sine">
                    <Sine />
                </div>
                <div
                className="button volume"
                onClick={() => { this.volume() }}
                data-tooltip={`Volume: ${this.state.volume}/${this.maxVolume}`}
                >
                    {volume}
                </div>
            </div>
        );
    }
}

export default Player;

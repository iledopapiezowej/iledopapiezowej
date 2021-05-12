import React from 'react'

import Counter from '../Counter'
import Eyes from '../Eyes'
import Player from '../Player';
import Chat from '../Chat';
import Promo from '../Promo';

import pkg from '../../../package.json'

import GaContext from '../../contexts/Ga'

import './style.css';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      event: false,
      elapsed: 0,
      count: 0,
      invisible: 0,
      promo: {
        hidden: true,
      }
    }

    fetch('/promo.json')
      .then(data => {
        return data.json()

      })
      .then(json => {
        this.setState({
          promo: {
            hidden: false,
            ...this.state.promo,
            ...json,
          }
        })
      })
  }

  eventStart(elapsed) {
    this.setState({
      event: true,
      elapsed: elapsed
    })
  }

  eventEnd() {
    this.setState({
      event: false,
      elapsed: 0
    })
  }

  render() {
    return (
      <div
        className={[
          this.state.event ? 'event' : '',
          this.props.values.rainbow ? 'rainbow' : ''
        ].join(' ')}>

        <GaContext.Consumer>{
          ga => {
            return (
              <Counter
                doClock={this.props.settings.clock}
                doDisplay={this.props.settings.display}
                onEventStart={(elapsed) => {
                  console.log(elapsed)
                  this.eventStart(elapsed)
                  ga.event({
                    category: '2137',
                    action: 'Event Start',
                    label: `${elapsed}s late`,
                    value: elapsed,
                    nonInteraction: true
                  })
                }}
                onEventEnd={() => {
                  this.eventEnd()
                  ga.event({
                    category: '2137',
                    action: 'Event End',
                    nonInteraction: true
                  })
                }}
                sync={this.props.sync}
              />
            )
          }}
        </GaContext.Consumer>


        <Player
          elapsed={this.state.elapsed}
          event={this.state.event}
          doMusic={this.props.settings.music}
        />

        <Eyes
          count={this.props.count}
          invisible={this.props.invisible}
          show={this.props.settings.eyes}
        />

        <Chat
          socket={this.props.socket}
          latest={this.props.socket.latest}
          show={this.props.settings.chat}
        />

        <Promo
          {...this.state.promo}
        />
        <div className="clear"></div>

        <span className="copyright">iledopapiezowej © 2020 v{pkg.version}</span>

        {/* <div id="footer">
          <a href="https://github.com/Maathias/iledopapiezowej">Maathias/iledopapiezowej</a> <span id='ver'></span>
        </div> */}

      </div>
    );
  }
}

export default Home;

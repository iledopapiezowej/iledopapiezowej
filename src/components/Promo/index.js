import React from 'react'

import GaContext from '../../contexts/Ga'

import './style.css'
import { ReactComponent as CaretUp } from './caret-up.svg'
import { ReactComponent as Close } from './close.svg'

class Promo extends React.Component {
    static defaultProps = {
        hidden: true,
        thumb: '',
        link: '',
        content: ""
    }

    constructor(props) {
        super(props)
        this.state = {
            open: false,
            closed: false
        }
    }

    render() {
        return (
            <GaContext.Consumer>{
                ga => {
                    return (<div
                        className={[
                            'promo',
                            this.props.hidden ? 'hidden' : '',
                            this.state.open ? 'open' : '',
                            this.state.closed ? 'closed' : ''
                        ].join(' ')}

                        onClick={() => {
                            if (!this.state.open) {
                                console.log('open and send')
                                this.setState({
                                    open: true
                                })
                                ga.event({
                                    category: 'Promo',
                                    action: 'Opened Modal',
                                    label: this.props.header
                                })
                            }
                        }}
                    >

                        <img
                            className="thumb"
                            src={this.props.thumb}
                            alt="nagłówek promocji"
                        />

                        <span className="header">
                            {this.props.header}

                            {
                                this.state.open ? <Close onClick={() => {
                                    this.setState({
                                        open: false,
                                        closed: true
                                    })
                                }} /> : <CaretUp />
                            }
                        </span>

                        <span className="sub">
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={this.props.link}
                                onClick={
                                    () => {
                                        ga.event({
                                            category: 'Promo',
                                            action: 'Clicked Link',
                                            label: this.props.link
                                        })
                                    }
                                }
                            >{this.props.link}</a>
                        </span>

                        <div className="clear"></div>

                        <div className="content">
                            {this.props.content}
                        </div>
                    </div>)
                }
            }</GaContext.Consumer>

        )
    }
}

export default Promo
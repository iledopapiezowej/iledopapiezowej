import React from 'react'

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

    open() {
        if (!this.state.open)
            this.setState({
                open: true
            })
    }

    close() {
        this.setState({
            open: false,
            closed: true
        })
    }

    render() {
        return (
            <div
                className={[
                    'promo',
                    this.props.hidden ? 'hidden' : '',
                    this.state.open ? 'open' : '',
                    this.state.closed ? 'closed' : ''
                ].join(' ')}

                onClick={() => { this.open() }}
            >

                <img
                    className="thumb"
                    src={this.props.thumb}
                    alt="nagłówek promocji"
                />

                <span className="header">
                    {this.props.header}

                    {
                        this.state.open ? <Close onClick={() => { this.close() }} /> : <CaretUp />
                    }
                </span>

                <span className="sub">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={this.props.link}
                    >{this.props.link}</a>
                </span>

                <div className="clear"></div>

                <div className="content">
                    {this.props.content}
                </div>
            </div>
        )
    }
}

export default Promo
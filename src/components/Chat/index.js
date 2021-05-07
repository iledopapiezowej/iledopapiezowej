import React from 'react'

import { ReactComponent as Send } from './send.svg'
import { ReactComponent as Down } from './down.svg'

import './index.css'
import './roles.css'

class Message extends React.Component {
    static defaultProps = {
        id: null,
        time: new Date(),
        nick: 'local',
        role: '',
        content: ""
    }

    // constructor(props) {
    //     super(props)
    // }

    // componentDidMount(){
    //     if(this.props.)
    //     this.refs.content.
    // }

    render() {
        return (<div className="message" ref="content">
            <span
                className={[
                    'nick',
                    this.props.role
                ].join(' ')}
                data-id={this.props.id}
            >
                {this.props.nick}
            </span>

            <span className="content">{this.props.content}</span>
            <span className="time" title={this.props.time.toString()}>
                {(() => {
                    let h = this.props.time.getHours(),
                        m = this.props.time.getMinutes(),
                        s = this.props.time.getSeconds()

                    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
                })()}
            </span>
        </div>)
    }
}

class Chat extends React.Component {
    static defaultProps = {
        show: true,
        socket: {},
        messageLimit: 300
    }

    constructor(props) {
        super(props)
        this.state = {
            nick: 'nickname',
            messages: props.latest.map(chunk => this._parse(chunk)),
            input: '',
            autoscroll: true
        }

        this.props.socket.addListener('onChatReceive', (data) => {
            data.id = Math.random().toString(36).substr(2, 9)
            this.receive(data)
        })

    }

    _parse(chunk) {
        return {
            id: chunk.id,
            time: chunk.time ? new Date(chunk.time) : new Date(),
            nick: chunk.nick,
            role: chunk.role,
            content: chunk.content
        }
    }

    receive(data) {
        let next = this.state.messages

        if (next.length > this.props.messageLimit) {
            next.shift()
        }

        next = next.concat(this._parse(data))

        this.setState({
            messages: next
        })

    }

    send() {
        let content = this.state.input

        if (content.length < 1) return

        this.props.socket.send({
            type: 'chat',
            content: content
        })

        this.refs.message.value = ''
    }

    componentDidUpdate() {
        if (this.refs.list) {
            if (this.refs.list.lastChild)
                if (this.state.autoscroll)
                    this.refs.list.lastChild.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                        inline: 'nearest'
                    })
        }
    }

    render() {

        return (
            <div className={[
                'chat',
                this.props.show ? '' : 'hidden'
            ].join(' ')}>

                <div
                    className="messages"
                    ref="list"
                >
                    {
                        this.state.messages.map((message) => (
                            <Message
                                key={message.id}
                                time={message.time}
                                nick={message.nick}
                                role={message.role}
                                content={message.content}
                            />
                        ))
                    }
                </div>

                <div className="input">
                    <input
                        type="text"
                        className="message"
                        ref="message"
                        maxLength="120"
                        autoComplete="off"
                        placeholder="czat"
                        onKeyUp={e => {
                            this.setState({
                                input: e.target.value
                            })
                        }}
                        onKeyDown={e => {
                            if (!e.shiftKey) if (e.key === 'Enter') this.send()
                        }}
                    />

                    <Down />

                    <button
                        className="send"
                        onClick={() => { this.send() }}
                    >
                        <Send />
                    </button>

                </div>
            </div>
        )
    }

}

export default Chat
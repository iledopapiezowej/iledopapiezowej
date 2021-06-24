import React from 'react'

import Checkbox from '../Checkbox/'

class Label extends React.Component {
    render() {
        return (
            <label
                className="label text"
            >
                <span className="caption">{this.props.caption}</span>
                <span className="desc">{this.props.desc}</span>
            </label>
        )
    }
}

class LabelLink extends Label {
    render() {
        return (
            <label
                className="label text link"
            >
                <span className="caption">{this.props.caption}</span>
                <a href={this.props.href} target={this.props.external ? "_blank" : '_self'} rel="noreferrer">
                    <span className="desc">{this.props.desc}</span>
                </a>
            </label>
        )
    }
}

class Field extends Label {
    render() {
        return (
            <label
                className="label text field"
            >
                <span className="header">{this.props.header}</span>
                <div className="content">{this.props.content}</div>
            </label>
        )
    }
}

class Toggle extends Label {
    static defaultProps = {
        key: '',
        id: '',
        type: 'toggle',
        caption: '',
        default: true,
        onClick: function () { }
    }

    constructor(props) {
        super(props)
        this.state = {
            checked: this.props.default
        }

    }

    click() {
        let checked = !this.state.checked
        this.setState({
            checked: checked
        })
        this.props.update(this.props.id, checked)
    }

    render() {
        return (
            <label
                className={[
                    "label",
                    "toggle",
                    this.state.checked ? 'checked' : ''
                ].join(' ')}
                onClick={(e) => { this.click() }}
            >
                <Checkbox
                    checked={this.state.checked}
                />
                <span className="caption">{this.props.caption}</span>
                <span className="desc">{this.props.desc}</span>
            </label>
        )
    }
}

export { Label, LabelLink, Field, Toggle }
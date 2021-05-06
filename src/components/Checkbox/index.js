import React from 'react'

import { ReactComponent as Box } from './checkbox.svg'

import './style.css'

class Checkbox extends React.Component {
    static defaultProps = {
        checked: false,
        onClick: function () { }
    }

    constructor(props){
        super(props)
        this.state = {
            checked: this.props.checked
        }
    }

    click(){
        let checked = !this.state.checked
        this.setState({
            checked: checked
        })
        this.props.onClick(checked)
    }

    render() {
        return (
            <Box
                className={this.props.checked ? 'checked' : ''}
                onClick={()=>{this.click()}}
            />
        )
    }
}

export default Checkbox
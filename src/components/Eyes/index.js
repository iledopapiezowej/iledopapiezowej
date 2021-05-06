import React from 'react'

import './style.css'

class Eyes extends React.Component {
    static defaultProps = {
        count: 0,
        invisible: 0,
        show: false
    }

    // constructor(props) {
    //     super(props)
    // }

    render() {
        return (<div
            className={[
                'eyes',
                (this.props.show) || (this.count < 1) ? '' : 'low'
            ].join(' ')}
            data-count={this.props.count}
            title={`${this.props.count} osób, ${100 - (this.props.invisible / this.props.count * 100).toFixed()}% aktywne`}
        >
        </div>)
    }
}

export default Eyes
import React from 'react'

class Page extends React.Component {
    static defaultProps = {
        title: "",
        prefix: '',
        separator: ' | ',
        suffix: 'iledopapiezowej.pl ⏳'
    }

    // constructor(props){
    //     super(props)
    // }

    _set(){
        // console.log('title set', this.props.title)
        document.title = this.props.title + this.props.separator + this.props.suffix
    }

    _clear(){
        // console.log('title clear')
        document.title = this.props.suffix
    }

    // componentDidUpdate() {
    //     // console.log('update')
    //     if (this.props.title.length > 0) {
    //         this._set()
    //     } else {
    //         // this._clear()
    //     }
    // }

    // componentDidMount() {
    //     // console.log('mount')
    //     if (this.props.title.length > 0) {
    //         this._set()
    //     } else {
    //         this._clear()
    //     }
    // }

    // componentWillUnmount() {
    //     // console.log('unmount')
    //     this._clear()
    // }

    render() {

        // console.log(this.props.id)

        return (
            <div className={`container ${this.props.id}`}>
                {this.props.children}
            </div>
        )
    }

}

export default Page
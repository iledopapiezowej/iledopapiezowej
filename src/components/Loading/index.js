import React from 'react'

import './style.css'

function Loading(props) {
    return (<>
        <div className="lds-ellipsis" title="Ładowanie">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>

        {props.percent ? (<div className="progress">
            <div
                className="fill"
                style={{
                    width: props.percent + '%'
                }}></div>
            <span>{props.percent + '%'}</span>
        </div>) : null}
    </>)
}

export default Loading;

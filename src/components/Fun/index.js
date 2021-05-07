import React from 'react'
import {
    Switch,
    Route,
    useRouteMatch,
    Link,
} from "react-router-dom";

import './style.css'


function Sub(props) {
    return (<>
        {props.children}
    </>
    )
}

function Fun(props) {
    let { url } = useRouteMatch()

    return (
            <Switch>
                {[
                    <div key="/">
                        {(props.children.map(child => {
                            return (
                                <Link className="el" key={child.props.id} to={`${url}/${child.props.id}`}>
                                    <img src={child.props.img} alt="" />
                                    <div className="header">{child.props.header}</div>
                                    <div className="desc">{child.props.desc}</div>
                                </Link>
                            )
                        }))}
                    </div>,
                    ...props.children
                ].map(child => {
                    return (
                        <Route
                            key={child.key}
                            path={`${url}${child.key}`}
                            exact
                        >
                            {child}
                        </Route>
                    )
                })}

            </Switch>

    )
}

export { Sub, Fun }
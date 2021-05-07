import React from 'react'
import { NavLink } from "react-router-dom";

import './style.css'

function Nav(props) {

    return (
        <nav>
            {props.links.map(link => {
                if (link.to) {
                    return (
                        <NavLink
                            className="link"
                            exact={link.to === '/'}
                            key={link.to}
                            to={link.to}
                        >
                            {link.header}
                        </NavLink>
                    )
                } else {
                    return (
                        <div className="link list">
                            {link.header}
                            {/* <CaretDown /> */}
                            <div className="subs">
                                {
                                    link.sub.map(sub => {
                                        return (
                                            <NavLink
                                                className="link"
                                                exact
                                                key={link.to}
                                                to={sub.to}
                                            >
                                                {sub.header}
                                            </NavLink>
                                        )
                                    })
                                }
                            </div>

                        </div>)
                }

            })
            }
            <span>iledopapiezowej.pl</span>
        </nav>
    )
}

export default Nav
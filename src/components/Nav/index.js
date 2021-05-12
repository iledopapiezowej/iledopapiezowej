import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useLocation } from "react-router-dom";

import GaContext from '../../contexts/Ga'

import './style.css'

function Nav(props) {
    let location = useLocation(),
        ga = useContext(GaContext),
        [interacted, setInteracted] = useState(false);
  
    useEffect(() => {
        let get = (obj, keys) => {
            if(keys.length > 1)
                return get(obj[keys[0]], keys.slice(1))
            else {
                let end = obj[keys[0]]
                if(typeof end == 'string')
                return end
                else return end['']

            }
        },
        pathname = location.pathname,
        title = get(props.titles, pathname.split('/')),
        suffix = 'iledopapiezowej.pl ⏳'

        document.title = title ? (title + ' | ' + suffix) : suffix
        ga.pageview(pathname)

      },
      [location]
    ) 

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
                            onClick={()=>{
                                if(!interacted){
                                    ga.event({
                                        category: 'Navigation',
                                        action: 'First Nav Interaction',
                                        label: link.header,
                                    })
                                    setInteracted(true)
                                }
                            }}
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
import { useContext, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import GaContext from '../../contexts/Ga.ctx'

import './style.css'

type navtabLink = {
	to: string
	header: string
}

type navProps = {
	links: navtabLink[]
}

function Nav({ links }: navProps) {
	let location = useLocation(),
		ga = useContext(GaContext),
		[interacted, setInteracted] = useState(false)

	useEffect(
		() => {
			const suffix = 'Ile do papieżowej? ⏳',
				pathname = location.pathname

			let title = links.find(({ to }) => to === pathname)?.header

			if (pathname === '/' || !title) document.title = suffix
			else document.title = `${title} | ${suffix}`

			ga.pageview(pathname)
		},
		[location] // eslint-disable-line
	)

	return (
		<nav>
			{links.map((link) => {
				if (link.to) {
					return (
						<NavLink
							className="link"
							exact={link.to === '/'}
							key={link.to}
							to={link.to}
							onClick={() => {
								if (!interacted) {
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
					return <div className="link list">{link.header}</div>
				}
			})}
			<span>iledopapiezowej.pl</span>
		</nav>
	)
}

export default Nav

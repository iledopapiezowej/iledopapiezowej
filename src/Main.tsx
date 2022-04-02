import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ga from 'react-ga4'

import Socket, { sync } from './Socket'

import Nav from './components/Nav'
import Home from './components/Home/Home'
import Chat from './components/Chat/Chat'
import Page from './components/Page/Page'
import { Fun, Sub as SubFun } from './components/Fun'
import { Settings, categories } from './components/Settings/Settings'

import GaContext from './contexts/Ga.ctx'
import SettingsContext from './contexts/Settings.ctx'
import SocketContext from './contexts/Socket.ctx'

const { REACT_APP_ID_GA } = process.env

// Google Analytics
ga.initialize(REACT_APP_ID_GA)

// default settings
const defSettings: { [key: string]: any } = {}

categories
	.map((o) => o.sections)
	.flat()
	.map((o) => o.labels)
	.flat()
	.map((o) => ({ id: o.id, default: o.default }))
	.forEach((o) => {
		let json = null

		try {
			json = JSON.parse(localStorage[o.id])
		} catch (err) {
			delete localStorage[o.id]
		}

		const def = json ?? null ?? o.default ?? null

		if (def !== null) defSettings[o.id] = def
	})

Object.keys(localStorage).forEach((name) => {
	try {
		defSettings[name] = JSON.parse(localStorage[name])
	} catch (err) {
		defSettings[name] = null
	}
})

var socket = new Socket()

function Main() {
	const [settings, setSettings] = useState(defSettings),
		[count, setCount] = useState(0),
		[invisible, setInvisible] = useState(0),
		[sync, setSync] = useState(socket.sync)

	function updateSettings(id: string, value: any) {
		setSettings((prevSettings) => ({ ...prevSettings, [id]: value }))
		localStorage[id] = JSON.stringify(value)
	}

	socket.addListener('onCount', ({ count, invisible }) => {
		setCount(count)
		setInvisible(invisible)
	})

	socket.addListener('onSync', (data: sync) => {
		setSync(data)

		// ga.timing({
		// 	category: 'Socket',
		// 	variable: 'ping',
		// 	value: data.ping,
		// })
		// ga.timing({
		// 	category: 'Socket',
		// 	variable: 'offset',
		// 	value: data.offset,
		// })
	})

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			<SocketContext.Provider value={socket}>
				<GaContext.Provider value={ga}>
					{/*				*/}
					<Router>
						<div className={['wrapper', settings.dark ? 'dark' : ''].join(' ')}>
							<Nav
								links={[
									{ to: '/', header: 'Home' },
									{ to: '/czat', header: 'Czat' },
									{ to: '/4fun', header: '4Fun' },
									{ to: '/ustawienia', header: 'Ustawienia' },
								]}
							/>

							<Routes>
								<Route path="/" element={<></>} />
								<Route
									path="/czat"
									element={
										<Page id="chat">
											<Chat />
										</Page>
									}
								/>

								<Route
									path="/ustawienia"
									element={
										<Page id="settings">
											<Settings />
										</Page>
									}
								/>

								<Route
									path="/4fun"
									element={
										<Page id="fun">
											<Fun>
												<SubFun
													id="clicker"
													key="/clicker"
													header="Clicker"
													desc="Klikaj papieża"
													img="/media/clicker_256.png"
												/>

												<SubFun
													id="place"
													key="/place"
													header="Place"
													desc="Stawiaj pojedyncze pixele, aby stworzyć wspólny obraz"
													img="/media/pixel_pap.png"
												/>
											</Fun>
										</Page>
									}
								/>
							</Routes>

							<Page id="home">
								<Home count={count} invisible={invisible} sync={sync} />
							</Page>
						</div>
					</Router>
					{/*				*/}
				</GaContext.Provider>
			</SocketContext.Provider>
		</SettingsContext.Provider>
	)
}

export default Main

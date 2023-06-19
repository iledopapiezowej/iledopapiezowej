import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ga from 'react-ga'

import Socket, { EVENT } from './Socket'
import { syncData } from './modules/sync'

import GaContext from './contexts/Ga.ctx'
import SettingsContext from './contexts/Settings.ctx'
import SocketContext from './contexts/Socket.ctx'

import Nav from './components/Nav'
import Home from './components/Home/Home'
import Chat from './components/Chat/Chat'
import Page from './components/Page/Page'
import { Fun, Sub as SubFun } from './components/Fun'
import { Settings, categories } from './components/Settings/Settings'

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
		[sync, setSync] = useState(socket.modules.sync.timings)

	function updateSettings(id: string, value: any) {
		setSettings((prevSettings) => ({ ...prevSettings, [id]: value }))
		localStorage[id] = JSON.stringify(value)
	}

	socket.addListener(EVENT.RECEIVE, 'count', ({ count }) => setCount(count))

	socket.addListener(EVENT.MODULE, 'synced', (data: syncData) => setSync(data))

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

							<Switch>
								<Route path="/czat">
									<Page id="chat">
										<Chat />
									</Page>
								</Route>

								<Route path="/ustawienia">
									<Page id="settings">
										<Settings />
									</Page>
								</Route>

								<Route path="/4fun">
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
								</Route>
							</Switch>

							<Page id="home">
								<Home count={count} sync={sync} />
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

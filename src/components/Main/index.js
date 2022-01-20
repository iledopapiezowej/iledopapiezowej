import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ga from 'react-ga'

import Socket from '../../Socket'
import { addListener, triggerEvent } from '../../Listener'

import Nav from '../Nav'
import Home from '../Home'
import Chat from '../Chat'
import Page from '../Page'
import { Fun, Sub as SubFun } from '../Fun'
import { Settings, categories } from '../Settings'

import GaContext from '../../contexts/Ga'
import SettingsContext from '../../contexts/Settings'
import SocketContext from '../../contexts/Socket'

import './style.css'

ga.initialize(process.env.REACT_APP_ID_GA)

class Main extends React.Component {
	constructor(props) {
		super(props)

		this.settings = {
			values: {},
			set: (id, value) => {
				this.settings.values[id] = value
				localStorage[id] = JSON.stringify(value)
				this.setState({ settings: this.settings.values })

				ga.event({
					category: 'Settings',
					action: 'Settings Changed',
					label: `${id}: ${value}`,
				})
			},
		}

		this.settings.values = { ...localStorage }

		for (let key in this.settings.values) {
			try {
				this.settings.values[key] = JSON.parse(this.settings.values[key])
			} catch (err) {}
		}

		for (let category of categories)
			for (let section of category.sections)
				for (let label of section.labels)
					if (typeof label.default !== 'undefined')
						if (typeof this.settings.values[label.id] == 'undefined')
							this.settings.values[label.id] = label.default

		this.state = {
			count: 0,
			invisible: 0,
			sync: {},
		}

		this.addListener = addListener
		this.triggerEvent = triggerEvent

		this.socket = new Socket({
			onCount: (data) => {
				this.setState({ count: data.count, invisible: data.invisible })
			},
			onSync: (data) => {
				this.setState({ sync: data })
				ga.timing({
					category: 'Socket',
					variable: 'ping',
					value: data.ping,
				})
				ga.timing({
					category: 'Socket',
					variable: 'offset',
					value: data.offset,
				})
			},
			// onVersion: data => { this.setState({ stats: data }) }
		})

		this.addListener('onUpdateSettings', (settings) => {
			this.setState({
				settings: settings,
			})
			this.settings.setAll(settings)
		})
	}

	render() {
		return (
			<SettingsContext.Provider value={this.settings}>
				<SocketContext.Provider value={this.socket}>
					<GaContext.Provider value={ga}>
						<Router>
							<div
								className={[
									'wrapper',
									this.settings.values.dark ? 'dark' : '',
								].join(' ')}
							>
								<Nav
									links={[
										{ to: '/', header: 'Home' },
										{ to: '/czat', header: 'Czat' },
										{ to: '/4fun', header: '4Fun' },
										{ to: '/ustawienia', header: 'Ustawienia' },
									]}
									ga={ga}
									titles={{
										'': {
											'': '',
											czat: 'Czat',
											ustawienia: 'Ustawienia',
											'4fun': {
												'': '4Fun',
												clicker: 'Clicker',
												place: 'Place',
											},
										},
									}}
								/>

								<Switch>
									<Route path="/czat">
										<Page id="chat" title="Czat">
											<Chat />
										</Page>
									</Route>

									<Route path="/ustawienia">
										<Page id="settings" title="Ustawienia">
											<Settings sync={this.state.sync} />
										</Page>
									</Route>

									<Route path="/4fun">
										<Page id="fun" title="4Fun">
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
									<Home
										count={this.state.count}
										invisible={this.state.invisible}
										sync={this.state.sync}
										socket={this.socket}
									/>
								</Page>
							</div>
						</Router>
					</GaContext.Provider>
				</SocketContext.Provider>
			</SettingsContext.Provider>
		)
	}
}

export default Main

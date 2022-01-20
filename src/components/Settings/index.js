import React, { useContext, useState } from 'react'

import { Label, LabelLink, Field, Toggle } from './Labels'

import { promptLogin } from '../../Login'
import pkg from '../../../package.json'

import SettingsContext from '../../contexts/Settings'
import SocketContext from '../../contexts/Socket'

import './style.css'
import './labels.css'

var categories = [
	{
		id: 'visuals',
		header: 'Wygląd',
		sections: [
			{
				id: 'home',
				header: 'Strona główna',
				labels: [
					{
						id: 'dark',
						type: 'toggle',
						caption: 'Dark Mode 🌙',
						default: true,
						desc: 'Tryb ciemny, dla wygody oczu',
					},
					{
						id: 'clock',
						type: 'toggle',
						caption: 'Zegar ⏰',
						default: true,
						desc: 'Wyświetlanie zegara',
					},
					{
						id: 'display',
						type: 'toggle',
						caption: 'Odliczanie ⏳',
						default: true,
						desc: 'Wyświetlanie odliczania',
					},
					{
						id: 'chat',
						type: 'toggle',
						caption: 'Czat 💬',
						default: true,
						desc: 'Wyświetlanie okna czatu',
					},
					{
						id: 'eyes',
						type: 'toggle',
						caption: 'Licznik 👁️',
						default: true,
						desc: 'Wyświetlanie licznika odwiedzających ',
					},
				],
			},
			{
				id: 'event',
				header: '⏳',
				labels: [
					{
						id: 'music',
						type: 'toggle',
						caption: 'Muzyka 🎶',
						default: true,
						desc: 'Automatyczne odtwarzanie muzyki',
					},
					{
						id: 'rainbow',
						type: 'toggle',
						caption: 'Tęcza 🌈',
						default: true,
						desc: 'Efekt animacji tęczy',
					},
				],
			},
		],
	},
	{
		id: 'about',
		header: 'Info',
		sections: [
			{
				// app
				id: 'app',
				header: 'Aplikacja',
				labels: [
					{
						id: 'version',
						type: 'text',
						caption: 'Wersja',
						desc: `v${pkg.version}`,
					},
					{
						id: 'lastUpdate',
						type: 'text',
						caption: 'Ostatni update',
						desc: `${new Date(
							pkg.lastUpdate
						).toLocaleDateString()}, ${Math.floor(
							(new Date() - new Date(pkg.lastUpdate)) / (1e3 * 60 * 60 * 24)
						)} dni temu`,
					},
					{
						id: 'author',
						type: 'link-external',
						caption: 'Github',
						desc: `github/iledopapiezowej`,
						href: 'https://github.com/iledopapiezowej',
					},
				],
			},
			{
				// server
				id: 'server',
				header: 'Serwer',
				labels: [
					{
						id: 'status',
						type: 'text',
						caption: 'Status',
						desc: ``,
					},
					{
						id: 'ping',
						type: 'text',
						caption: 'Ping',
						desc: ``,
					},
					{
						id: 'offset',
						type: 'text',
						caption: 'Opóźnienie',
						desc: ``,
					},
				],
			},
			{
				// contact
				id: 'contact',
				header: 'Kontakt',
				labels: [
					{
						id: 'mail',
						type: 'link-external',
						caption: 'Email',
						desc: `kontakt@iledopapiezowej.pl`,
						href: 'mailto:kontakt@iledopapiezowej.pl',
					},
					{
						id: 'fb',
						type: 'link-external',
						caption: 'Facebook',
						desc: `iledopapiezowej`,
						href: 'https://facebook.com/iledopapiezowej',
					},
					{
						id: 'dc',
						type: 'link-external',
						caption: 'Discord',
						desc: `Oficjalny serwer Discord`,
						href: 'https://discord.gg/BwBzdEJecC',
					},
				],
			},
			{
				// rules
				id: 'rules',
				header: 'Regulamin',
				labels: [
					{
						id: 'general',
						type: 'field',
						header: 'Ogólne',
						content: `1. Nie biorę odpowiedzialności za jakiekolwiek zawartości wysłane przez innych użytkowników\n2. Administracja zastrzega sobie prawo do usunięcia/zbanowania/zablokowania IP użytkownika bez szczególnego uzasadnienia.`,
					},
					{
						id: 'cookies',
						type: 'field',
						header: 'Cookies',
						content: `Używamy cookies do utrzymywania statystyk poprzez Google Analytics. Pozostając na stronie wyrażasz zgode na ich użycie.`,
					},
				],
			},
		],
	},
]

class Tab extends React.Component {
	static defaultProps = {
		id: '',
		header: '',
		active: false,
		onClick: function () {},
	}

	render() {
		return (
			<div
				className={[
					'tab',
					this.props.id,
					this.props.active ? 'active' : '',
				].join(' ')}
				onClick={() => {
					this.props.onClick(this.props.id)
				}}
			>
				{this.props.header}
			</div>
		)
	}
}

class Category extends React.Component {
	static defaultProps = {
		id: '',
		header: '',
		sections: {},
		settings: {},
		values: {},
		active: false,
	}

	render() {
		return (
			<div
				className={['category', this.props.active ? 'active' : ''].join(' ')}
			>
				<h2>{this.props.header}</h2>
				{this.props.sections.map((section) => {
					return (
						<Section
							key={section.id}
							header={section.header}
							labels={section.labels}
							values={this.props.values}
							update={this.props.update}
						/>
					)
				})}
			</div>
		)
	}
}

class Section extends React.Component {
	static defaultProps = {
		key: '',
		header: '',
		labels: {},
		values: {},
		onUpdate: function () {},
	}

	render() {
		return (
			<div className="section" key={this.props.header}>
				<div className="header">{this.props.header}</div>

				{this.props.labels.map((label) => {
					switch (label.type) {
						default:
						case 'text':
							return <Label key={label.id} {...label} />

						case 'link-external':
							var external = true

						// eslint-disable-next-line
						case 'link':
							return <LabelLink key={label.id} external={external} {...label} />

						case 'field':
							return <Field key={label.id} {...label} />

						case 'toggle':
							return (
								<Toggle
									key={label.id}
									{...label}
									default={this.props.values[label.id]}
									update={this.props.update}
								/>
							)
					}
				})}
			</div>
		)
	}
}

function Settings(props) {
	const [active, setActive] = useState(categories[0].id)

	let socket = useContext(SocketContext)

	let server = categories
			.find((category) => category.id === 'about')
			.sections.find((section) => section.id === 'server'),
		values = {
			status: socket.sync.ping > 0 ? 'Połączono ✅' : 'Rozłączono ❌',
			ping: `${Math.floor(socket.sync.ping)}ms`,
			offset: `${Math.floor(socket.sync.offset)}ms`,
		}

	for (let v in values) {
		server.labels.find((label) => label.id === v).desc = values[v]
	}

	return (
		<>
			<h1>Ustawienia 🔧</h1>
			<div className="content">
				<div className="categories">
					{categories.map((category) => {
						return (
							<Tab
								key={category.id}
								id={category.id}
								header={category.header}
								active={active === category.id ? true : false}
								onClick={(id) => {
									setActive(id)
								}}
							/>
						)
					})}
				</div>
				<SettingsContext.Consumer>
					{(settings) => {
						return categories.map((category) => (
							<Category
								key={category.id}
								id={category.id}
								header={category.header}
								active={active === category.id ? true : false}
								sections={category.sections}
								values={settings.values}
								update={settings.set}
							/>
						))
					}}
				</SettingsContext.Consumer>
			</div>
		</>
	)
}

export { categories, Settings }

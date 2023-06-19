import { useContext, useState } from 'react'

import socketContext from '../../contexts/Socket.ctx'
import SettingsContext from '../../contexts/Settings.ctx'

import { Label, LabelLink, Field, Toggle } from './Labels'

import './style.css'
import './labels.css'

export type labelType = {
	id: string
	type: 'toggle' | 'text' | 'link' | 'link-external' | 'field'
	caption: string
	desc: string

	default?: boolean | undefined
	href?: string
	content?: string
	external?: boolean
}

type sectionType = {
	id: string
	header: string
	labels: labelType[]
}

type categoryType = {
	id: string
	header: string
	sections: sectionType[]
}

var categories: categoryType[] = [
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
				id: 'app',
				header: 'Aplikacja',
				labels: [
					{
						id: 'version',
						type: 'text',
						caption: 'Commit',
						desc: process.env.GITHUB_SHA ?? '???????',
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
				id: 'server',
				header: 'Serwer',
				labels: [
					{
						id: 'status',
						type: 'text',
						caption: 'Status',
						desc: '',
					},
					{
						id: 'ping',
						type: 'text',
						caption: 'Ping',
						desc: '',
					},
					{
						id: 'offset',
						type: 'text',
						caption: 'Opóźnienie',
						desc: '',
					},
				],
			},
			{
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
				id: 'rules',
				header: 'Regulamin',
				labels: [
					{
						id: 'general',
						type: 'field',
						caption: 'Ogólne',
						desc: 'Zasady dotyczące użytkowania strony',
						content: `1. Nie biorę odpowiedzialności za jakiekolwiek zawartości wysłane przez innych użytkowników\n2. Administracja zastrzega sobie prawo do usunięcia/zbanowania/zablokowania IP użytkownika bez szczególnego uzasadnienia.`,
					},
					{
						id: 'cookies',
						type: 'field',
						caption: 'Cookies',
						desc: 'Zasady dotyczące cookies',
						content: `Używamy cookies do utrzymywania statystyk poprzez Google Analytics. Pozostając na stronie wyrażasz zgode na ich użycie.`,
					},
				],
			},
		],
	},
]

type TabProps = {
	id: string
	header: string
	active: boolean
	onClick: (id: string) => unknown
}

function Tab({ id, header, active, onClick }: TabProps) {
	return (
		<div
			className={['tab', id, active ? 'active' : ''].join(' ')}
			onClick={() => {
				onClick(id)
			}}
		>
			{header}
		</div>
	)
}

function Category({
	id,
	header,
	sections,
	active,
}: categoryType & { active: boolean }) {
	return (
		<div className={['category', active ? 'active' : ''].join(' ')}>
			<h2>{header}</h2>

			{sections.map((section) => {
				return (
					<Section
						key={section.id}
						id={section.id}
						header={section.header}
						labels={section.labels}
					/>
				)
			})}
		</div>
	)
}

function Section({ id, header, labels }: sectionType) {
	let { settings, updateSettings } = useContext(SettingsContext)

	return (
		<div className="section" key={header}>
			<div className="header">{header}</div>

			{labels.map((label) => {
				switch (label.type) {
					default:
					case 'text':
						return <Label key={label.id} {...label} />

					case 'link-external':
					case 'link':
						return (
							<LabelLink
								key={label.id}
								external={label.type === 'link-external'}
								{...label}
							/>
						)

					case 'field':
						return <Field key={label.id} {...label} />

					case 'toggle':
						return (
							<Toggle
								key={label.id}
								{...label}
								def={settings[label.id]}
								onClick={updateSettings}
							/>
						)
				}
			})}
		</div>
	)
}

function Settings() {
	const [active, setActive] = useState(categories[0].id),
		socket = useContext(socketContext)

	categories
		.find((category) => category.id === 'about')
		?.sections.find((section) => section.id === 'server')
		?.labels.map(
			(label) =>
				(label.desc =
					{
						status:
							socket.modules.sync.timings.ping > 0
								? 'Połączono ✅'
								: 'Rozłączono ❌',
						ping: `${Math.floor(socket.modules.sync.timings.ping)}ms`,
						offset: `${Math.floor(socket.modules.sync.timings.offset)}ms`,
					}[label.id] ?? '')
		)

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
								onClick={(id) => setActive(id)}
							/>
						)
					})}
				</div>
				{categories.map((category) => (
					<Category
						key={category.id}
						id={category.id}
						header={category.header}
						active={active === category.id ? true : false}
						sections={category.sections}
					/>
				))}
			</div>
		</>
	)
}

export { categories, Settings }

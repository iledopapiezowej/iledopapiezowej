import { createContext } from 'react'

type Settings = {
	settings: { [keys: string]: any }
	updateSettings: (id: string, value: any) => void
}

const SettingsContext = createContext<Settings>({
	settings: {},
	updateSettings: (id, value) => {},
})

export default SettingsContext

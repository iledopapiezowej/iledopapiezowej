import { createContext } from 'react'

const GaContext = createContext({
	event: (options: any) => {},
	pageview: (options: any) => {},
})

export default GaContext

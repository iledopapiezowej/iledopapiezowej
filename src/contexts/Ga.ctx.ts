import { createContext } from 'react'

const GaContext = createContext({
	event: (options: any) => {},
	send: (options: any) => {},
})

export default GaContext

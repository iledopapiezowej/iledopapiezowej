type labelType = {
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

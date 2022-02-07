type pageProps = {
	id: string
	children: JSX.Element
}

function Page({ id, children }: pageProps) {
	return <div className={`container ${id}`}>{children}</div>
}

export default Page

import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import Socket from '../../Socket'
import { addListener, addStateListener, triggerEvent } from '../../Listener'

import Nav from '../Nav'
import Home from '../Home'
import Chat from '../Chat'
import Page from '../Page'
import {
    Fun,
    // Sub as SubFun
} from '../Fun'

import {
    Settings,
    categories
} from '../Settings'

import './style.css'
import './dark.css';

class Main extends React.Component {
    constructor(props) {
        super(props)

        this.settings = {
            values: {},
            set: (id, value) => {
                this.settings.values[id] = value
                localStorage[`settings-${id}`] = JSON.stringify(value)
                this.setState({
                    settings: this.settings.values
                })
            }
        }
        for (let category of categories) {
            for (let section of category.sections) {
                for (let label of section.labels) {
                    if(!label.default) continue

                    let value = localStorage[`settings-${label.id}`],
                        out = label.default
                    try{
                        out = JSON.parse(value || label.default)
                    }catch(err){
                        console.error(label, err)
                    }
                    this.settings.values[label.id] = out
                }
            }
        }


        this.state = {
            settings: this.settings.values,
            count: 0,
            invisible: 0,
            sync: {}
        }

        this.addListener = addListener
        this.addStateListener = addStateListener
        this.triggerEvent = triggerEvent

        this.socket = new Socket({
            onCount: data => { this.setState({ count: data.count, invisible: data.invisible }) },
            onSync: data => { this.setState({ sync: data }) },
            // onVersion: data => { this.setState({ stats: data }) }
        })

        this.addListener('onUpdateSettings', (settings) => {
            this.setState({
                settings: settings
            })
            this.settings.setAll(settings)
        })
    }

    render() {

        return (
            <Router>
                <div className={[
                    'wrapper',
                    this.state.settings.dark ? 'dark' : ''
                ].join(' ')}>

                    <Nav
                        links={[
                            { to: '/', header: 'Home' },
                            { to: '/czat', header: 'Czat' },
                            { to: '/4fun', header: '4Fun' },
                            { to: '/ustawienia', header: 'Ustawienia' }
                        ]}
                    />

                    <Switch>
                        <Route path="/czat">
                            <Page id="chat" title="Czat">
                                <Chat
                                    // messages={this.socket.chat.messages}
                                    socket={this.socket}
                                    latest={this.socket.latest}
                                />
                            </Page>

                        </Route>

                        <Route path="/ustawienia">
                            <Page id="settings" title="Ustawienia">
                                <Settings
                                    values={this.state.settings}
                                    sync={this.state.sync}
                                    update={(id, value) => {
                                        this.settings.set(id, value)
                                    }}
                                />
                            </Page>

                        </Route>

                        <Route path="/4fun">
                            <Page id="fun" title="4Fun">
                                <Fun>
                                    <div
                                        id="clicker"
                                        key="/clicker"
                                        header="Clicker"
                                        desc="Klikaj papieża"
                                        img="/media/clicker_256.png"
                                    >
                                        <h1>Coming soon</h1>
                                    </div>

                                    <div
                                        id="place"
                                        key="/place"
                                        header="Place"
                                        desc="Stawiaj pojedyncze pixele, aby stworzyć wspólny obraz"
                                        img="/media/pixel_pap.png"
                                    >
                                        <h1>Coming soon</h1>
                                    </div>

                                </Fun>

                            </Page>

                        </Route>

                    </Switch>

                    <Page id="home">
                        <Home
                            settings={this.state.settings}
                            count={this.state.count}
                            invisible={this.state.invisible}
                            values={this.state.settings}
                            sync={this.state.sync}
                            socket={this.socket}
                        />
                    </Page>
                </div>
            </Router>
        )
    }
}

export default Main
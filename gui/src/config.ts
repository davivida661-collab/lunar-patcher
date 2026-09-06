import {writable} from "svelte/store";

const dev: boolean = import.meta.env.DEV

let defaultConfig = {
    cosmeticsEnabled: false,

    crackedEnabled: false,
    crackedUsername: '',

    freelookEnabled: false,

    noHitDelayEnabled: false,

    customJvmEnabled: false,
    customJvm: '',

    jvmArgsEnabled: true,
    jvmArgs: '',

    debugModsEnabled: false,

    fpsSpoofEnabled: false,
    fpsSpoofMultiplier: 1.0,

    rawInputEnabled: false,

    packFixEnabled: false,

    agents: [] as { enabled: boolean, path: string, option: string }[]
}

export type Config = typeof defaultConfig

function createConfig() {
    let initial: Config = {...defaultConfig}

    if (!dev) {
        const { ipcRenderer } = require('electron')
        initial = {...initial, ...ipcRenderer.sendSync('LCQT_READ_CONFIG')}

        if (typeof(initial.customJvm) == 'boolean') {
            initial.customJvm = ''
        }
    } else {
        // Dev mode: restore last state from localStorage so pages can be tested standalone.
        try {
            const stored = localStorage.getItem('lcqt2-dev-config')
            if (stored) initial = {...initial, ...JSON.parse(stored)}
        } catch {
            // corrupted/unavailable storage - fall back to defaults
        }
    }

    const store = writable(initial)

    // Persist the config on every mutation of the store. Subscribing here keeps
    // the reference alive for the whole app lifetime, so every change made in any
    // page (modules, agents, settings) is written back. Previously this relied on
    // a window 'change' event that only some components dispatched, leaving most
    // edits unsaved until restart.
    const persist = (value: Config) => {
        if (dev) {
            try {
                localStorage.setItem('lcqt2-dev-config', JSON.stringify(value))
            } catch {
                // ignore storage failures in dev
            }
        } else {
            require('electron').ipcRenderer.send('LCQT_WRITE_CONFIG', value)
        }
    }

    store.subscribe(persist)

    return store
}

export const config = createConfig()
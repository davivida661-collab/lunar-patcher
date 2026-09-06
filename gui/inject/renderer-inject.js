import syringe from './syringe.svg'

function waitForElement(selector) {
    return new Promise(resolve => {
        const existing = document.querySelector(selector)
        if (existing) {
            return resolve(existing)
        }

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector)
            if (el) {
                observer.disconnect()
                resolve(el)
            }
        })

        observer.observe(document.body, {
            subtree: true,
            childList: true
        })
    })
}

waitForElement('.fa-gears').then(faGears => {
    const settingsButton = faGears.parentNode
    if (!settingsButton) return

    // Avoid injecting a duplicate syringe button if the settings page re-renders
    if (document.getElementById('lcqt-syringe-button')) return

    let clone = settingsButton.cloneNode(false)
    clone.id = 'lcqt-syringe-button'
    clone.innerHTML = `<img src='${syringe}' width='30' alt='lcqt'/>`
    clone.addEventListener('click', () => window.electron.ipcRenderer.sendMessage('LCQT_OPEN_WINDOW'))

    settingsButton.parentNode.insertBefore(clone, settingsButton)
}).catch(() => {
    // Never let injection errors surface to the launcher UI
})

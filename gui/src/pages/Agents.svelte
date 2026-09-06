<script lang="ts">
    import trash from '../assets/trash.svg'
    import {config, type Config} from '../config'

    type Agent = Config['agents'][number]

    function addAgent(file: File) {
        const path = (file as File & { path?: string }).path ?? file.name
        if ($config.agents.some(a => a.path === path)) {
            return
        }

        $config.agents = [...$config.agents, {
            enabled: true,
            path,
            option: ''
        }]
    }

    function removeAgent(i: number) {
        $config.agents = $config.agents.filter((_, index) => index !== i)
    }

    function onFilesChosen(this: HTMLInputElement, e: Event) {
        const target = e.currentTarget as HTMLInputElement
        const files = target?.files
        if (!files) return
        for (const file of files) {
            addAgent(file)
        }
        this.value = ''
    }
</script>

<div class="flex flex-col items-stretch h-full">
    <div class="h-[52px] flex-shrink-0 bg-white flex items-center text-lg relative px-2">
        <div class="flex-1">
            <label class="border-2 border-black rounded-md w-9 h-9 text-4xl flex justify-center border-opacity-70 cursor-pointer">
                <input
                        type="file"
                        class="hidden"
                        accept=".jar"
                        multiple
                        on:change={onFilesChosen}
                >
                <span class="absolute top-1 font-light opacity-80">+</span>
            </label>
        </div>
        Java Premain Agents
        <div class="flex-1"></div>
    </div>

    <div
            role="region"
            aria-label="Java agents list"
            class="flex flex-col p-4 gap-2 overflow-y-scroll flex-grow"
            on:dragover|preventDefault
            on:drop|preventDefault={e => {
                for(const file of e.dataTransfer.files) {
                    if(file.name.endsWith('.jar')) {
                        addAgent(file)
                    }
                }
            }}
    >
        {#each $config.agents as agent, i (agent.path)}
            <div class="flex items-center bg-white px-2 w-full h-10 rounded-lg agent">
                <input tabindex="-1" type="checkbox" class="scale-[115%]" bind:checked={agent.enabled}>
                <span
                        role="checkbox"
                        tabindex="0"
                        aria-checked={agent.enabled}
                        title={agent.path}
                        class="ml-2 h-10 flex items-center"
                        on:click={() => {
                            agent.enabled = !agent.enabled
                        }}
                        on:keydown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                agent.enabled = !agent.enabled
                            }
                        }}
                >
                    {agent.path.replace(/^.*[\\\/]/, '')}
                </span>
                <div class="flex-1"></div>
                <input
                        type="text"
                        class="outline-none p-1 text-sm border-2 rounded mr-1"
                        placeholder="Option"
                        spellcheck="false"
                        bind:value={agent.option}
                >
                <button tabindex="-1" class="flex justify-center items-center" on:click={() => removeAgent(i)}>
                    <img draggable="false" src={trash} alt="remove" width="26" class="opacity-75">
                </button>
            </div>
        {/each}
    </div>
</div>


<style>
    .agent {
        box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }
</style>
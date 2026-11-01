// Windows-only postinstall step for the hoisted nodeLinker layout.
//
// nodeLinker:hoisted writes real package dirs at the workspace node_modules
// root while CJS dependencies keep resolving through .pnpm junctions. The
// two physical paths make vitest (jsdom) load TWO vue module instances —
// one through vite's root resolution, one through Node's .pnpm requires —
// and useTemplateRef then throws "Cannot define property ... object is not
// extensible" because each instance compares against its own frozen
// @vue/shared EMPTY_OBJ.
//
// The fix: replace the root real-dir copies of the vue family with
// junctions into the same .pnpm store entries everything else resolves
// through, so both resolution paths collapse onto one module instance.
// On non-Windows platforms pnpm already links through symlinks and this
// script exits without doing anything.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

if (os.platform() !== 'win32') {
    process.exit(0)
}

const nodeModules = path.resolve(__dirname, '..', 'node_modules')
const pnpmDir = path.join(nodeModules, '.pnpm')

if (!fs.existsSync(pnpmDir)) {
    process.exit(0)
}

// Locate the vue store entry, e.g. .pnpm/vue@3.5.28_typescript@5.9.3
const vueEntry = fs.readdirSync(pnpmDir).find(e => /^vue@/.test(e))
if (!vueEntry) {
    console.log('link-vue-family: no vue store entry found, skipping')
    process.exit(0)
}

// That entry's node_modules contains the vue package plus links to its
// @vue/* dependencies — resolve each to its real .pnpm target.
const vueDeps = path.join(pnpmDir, vueEntry, 'node_modules')
const family = ['vue', '@vue/runtime-dom', '@vue/runtime-core', '@vue/shared', '@vue/reactivity']

for (const name of family) {
    const source = path.join(vueDeps, name)
    if (!fs.existsSync(source)) {
        continue
    }
    const target = fs.realpathSync(source)
    const link = path.join(nodeModules, name)
    if (fs.existsSync(link) && fs.realpathSync(link) === target) {
        continue
    }
    if (fs.existsSync(link)) {
        fs.rmSync(link, { recursive: true, force: true })
    }
    execFileSync('cmd', ['/c', 'mklink', '/J', link, target], { stdio: 'ignore' })
    console.log(`link-vue-family: ${name} -> ${path.relative(nodeModules, target)}`)
}

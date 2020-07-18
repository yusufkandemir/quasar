/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/
<% if (__supportsIE) { %>
import 'quasar/dist/quasar.ie.polyfills.js'
<% } %>

<% extras.length > 0 && extras.filter(asset => asset).forEach(asset => { %>
import '@quasar/extras/<%= asset %>/<%= asset %>.css'
<% }) %>

<% animations.length > 0 && animations.filter(asset => asset).forEach(asset => { %>
import '@quasar/extras/animate/<%= asset %>.css'
<% }) %>

// We load Quasar stylesheet file
import 'quasar/dist/quasar.<%= __css.quasarSrcExt %>'

<% if (framework.cssAddon) { %>
// We add Quasar addons, if they were requested
import 'quasar/src/css/flex-addon.<%= __css.quasarSrcExt %>'
<% } %>

<% css.length > 0 && css.filter(asset => asset.client !== false).forEach(asset => { %>
import '<%= asset.path %>'
<% }) %>

import createApp from './app.js'

<% if (ctx.mode.pwa) { %>
import 'app/<%= sourceFiles.registerServiceWorker %>'
<% if (ctx.mode.ssr) { %>
import { isRunningOnPWA } from './ssr-pwa'
<% } %>
<% } %>

<%
const bootNames = []
if (boot.length > 0) {
  function hash (str) {
    const name = str.replace(/\W+/g, '')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  boot.filter(asset => asset.client !== false).forEach(asset => {
    let importName = 'qboot_' + hash(asset.path)
    bootNames.push(importName)
%>
import <%= importName %> from '<%= asset.path %>'
<% }) } %>

<% if (preFetch) { %>
import { addPreFetchHooks } from './client-prefetch.js'
<% } %>

<% if (ctx.mode.electron && electron.nodeIntegration === true) { %>
// Used below, in start function
import electron from 'electron'
<% } %>

<% if (ctx.dev) { %>
console.info('[Quasar] Running <%= ctx.modeName.toUpperCase() + (ctx.mode.ssr && ctx.mode.pwa ? ' + PWA' : '') %>.')
<% if (ctx.mode.pwa) { %>console.info('[Quasar] PWA: Use devtools > Application > "Bypass for network" to not break Hot Module Replacement while developing.')<% } %>
<% } %>

<% if (ctx.mode.cordova && ctx.target.ios) { %>
import '@quasar/fastclick'
<% } else if (ctx.mode.pwa) { %>
// Needed only for iOS PWAs
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && window.navigator.standalone) {
  import(/* webpackChunkName: "fastclick"  */ '@quasar/fastclick')
}
<% } %>

const publicPath = `<%= build.publicPath %>`
<% if (build.publicPath.length > 1) { %>
const doubleSlashRE = /\/\//
const addPublicPath = url => (publicPath + url).replace(doubleSlashRE, '/')
<% } %>

async function start () {
  const { app, <%= store ? 'store, ' : '' %>router } = await createApp()

  <% if (ctx.dev) { %>
  app.config.devtools = true
  <% } %>

  <% if (ctx.mode.electron && electron.nodeIntegration === true) { %>
  app.config.globalProperties.$q.electron = electron
  <% } %>

  // TODO: Vue 3 SSR
  <% if (ctx.mode.ssr && store && ssr.manualHydration !== true) { %>
  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  if (<% if (ctx.mode.pwa) { %>isRunningOnPWA !== true && <% } %>window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }
  <% } %>

  <% if (bootNames.length > 0) { %>
  let hasRedirected = false
  const redirect = url => {
    hasRedirected = true
    const normalized = Object(url) === url
      ? <%= build.publicPath.length <= 1 ? 'router.resolve(url).fullPath' : 'addPublicPath(router.resolve(url).fullPath)' %>
      : url

    window.location.href = normalized
  }

  const urlPath = window.location.href.replace(window.location.origin, '')
  const bootFiles = [<%= bootNames.join(',') %>]

  for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
    if (typeof bootFiles[i] !== 'function') {
      continue
    }

    try {
      await bootFiles[i]({
        // TODO: Discuss about this. Should we pass the app directly or just `app.config`?
        app,
        router,
        <%= store ? 'store,' : '' %>
        // Vue,
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        window.location.href = err.url
        return
      }

      console.error('[Quasar] boot error:', err)
      return
    }
  }

  if (hasRedirected === true) {
    return
  }
  <% } %>

  // TODO: Vue 3 SSR
  <% if (ctx.mode.ssr) { %>
    <% if (ctx.mode.pwa) { %>
      if (isRunningOnPWA === true) {
        <% if (preFetch) { %>
        addPreFetchHooks(router<%= store ? ', store' : '' %>)
        <% } %>
        app.mount(app.el)
      }
      else {
    <% } %>
    // wait until router has resolved all async before hooks
    // and async components...
    await router.isReady()
    <% if (preFetch) { %>
    addPreFetchHooks(router<%= store ? ', store' : '' %>, publicPath)
    <% } %>
    app.mount('#q-app')
    <% if (ctx.mode.pwa) { %>
    }
    <% } %>

  <% } else { // not SSR %>

    <% if (preFetch) { %>
    addPreFetchHooks(router<%= store ? ', store' : '' %>)
    <% } %>

    <% if (ctx.mode.cordova) { %>
    document.addEventListener('deviceready', () => {
      app.config.globalProperties.$q.cordova = window.cordova
    <% } else if (ctx.mode.capacitor) { %>
      app.config.globalProperties.$q.capacitor = window.Capacitor
    <% } %>

    <% if (!ctx.mode.bex) { %>
      // TODO: Discuss about this. Should this run always or when a specific config option is set?
      // This is required for transitions
      await router.isReady()

      app.mount(app.el)
    <% } %>

    <% if (ctx.mode.cordova) { %>
    }, false) // on deviceready
    <% } %>

    <% if (ctx.mode.bex) { %>
      let vApp = null
      window.QBexInit = function (shell) {
        shell.connect(bridge => {
          window.QBexBridge = bridge
          app.config.globalProperties.$q.bex = window.QBexBridge
          vApp = app.mount(app.el)
        })
      }
    <% } %>

  <% } // end of Non SSR %>

}

start()

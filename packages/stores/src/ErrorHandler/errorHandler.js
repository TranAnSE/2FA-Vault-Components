import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Optional router bridge.
 *
 * Pinia setup stores do not have access to `this.$router` (that property only
 * exists on Options-API stores backed by a component instance). When this
 * store is called from a non-component context — such as an Axios response
 * interceptor in a service module — `this.$router` is undefined and any
 * attempt to use it throws, silently swallowing the error.
 *
 * Consumers that want `show()` / `notFound()` to navigate must register the
 * router once during app bootstrap via `configureErrorHandlerRouter(router)`.
 * If no router is registered, the navigation is skipped gracefully so the
 * error state is still exposed for the UI to react to.
 */
let registeredRouter = null

export function configureErrorHandlerRouter(router) {
    registeredRouter = router
}

export const useErrorHandler = defineStore('errorHandler', () => {

    // STATE

    const lastError = ref(null)
    const message = ref(null)
    const reasons = ref(null)
    const originalMessage = ref(null)
    const debug = ref(null)

    // ACTIONS

    function $reset() {
        lastError.value = null
        message.value = null
        reasons.value = null
        originalMessage.value = null
        debug.value = null
    }

    /**
     *
     */
    function parse(error) {
        $reset
        lastError.value = error

        // Handle axios response error
        if (error.response) {
            if (error.response.data) {
                message.value = error.response.data.message ?? null,
                originalMessage.value = error.response.data.originalMessage ?? null
                reasons.value = error.response.data.reason ?? null
                debug.value = error.response.data.debug ?? null
            }

            if (error.response.status === 407) {
                message.value = 'error.auth_proxy_failed',
                originalMessage.value = 'error.auth_proxy_failed.legend'
            }
            else if (error.response.status === 403) {
                message.value = 'error.unauthorized',
                originalMessage.value = 'error.unauthorized.legend'
            }
        } else {
            message.value = error.message
            debug.value = error.stack ?? null
        }

        if (reasons.value && ! Array.isArray(reasons.value)) {
            reasons.value = new Array(reasons.value)
        }
    }

    /**
     * Navigate to the generic error page. Falls back gracefully when no
     * router has been registered (e.g. when called from a service module
     * before the app bootstrap completes).
     */
    function show(error) {
        parse(error)
        if (registeredRouter) {
            registeredRouter.push({ name: 'genericError' })
        }
    }

    /**
     * Push the user to the notFound error page
     */
    function notFound() {
        if (registeredRouter) {
            registeredRouter.push({ name: '404' })
        }
    }

    return {
        // STATE
        lastError,
        message,
        reasons,
        originalMessage,
        debug,

        // ACTIONS
        parse,
        show,
        notFound,
    }
})
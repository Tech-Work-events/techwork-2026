'use strict'
// Point d'entrée principal des Firebase Functions
// Exports des différentes fonctions
Object.defineProperty(exports, '__esModule', { value: true })
exports.processRGPDRequest = exports.subscribeNewsletter = void 0
var newsletter_1 = require('./handlers/newsletter')
Object.defineProperty(exports, 'subscribeNewsletter', {
    enumerable: true,
    get: function () {
        return newsletter_1.subscribeNewsletter
    },
})
var rgpd_1 = require('./handlers/rgpd')
Object.defineProperty(exports, 'processRGPDRequest', {
    enumerable: true,
    get: function () {
        return rgpd_1.processRGPDRequest
    },
})
//# sourceMappingURL=index.js.map

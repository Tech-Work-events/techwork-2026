'use strict'
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              var desc = Object.getOwnPropertyDescriptor(m, k)
              if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k]
                      },
                  }
              }
              Object.defineProperty(o, k2, desc)
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              o[k2] = m[k]
          })
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', { enumerable: true, value: v })
          }
        : function (o, v) {
              o['default'] = v
          })
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = []
                    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
                    return ar
                }
            return ownKeys(o)
        }
        return function (mod) {
            if (mod && mod.__esModule) return mod
            var result = {}
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== 'default') __createBinding(result, mod, k[i])
            __setModuleDefault(result, mod)
            return result
        }
    })()
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod }
    }
Object.defineProperty(exports, '__esModule', { value: true })
exports.corsHandler = exports.brevoApiInstance = exports.brevoConfig = void 0
const admin = __importStar(require('firebase-admin'))
const SibApiV3Sdk = __importStar(require('@getbrevo/brevo'))
const cors_1 = __importDefault(require('cors'))
// Initialiser Firebase Admin
admin.initializeApp()
// Configuration Brevo via variables d'environnement
exports.brevoConfig = {
    apiKey: process.env.BREVO_API_KEY || 'your-brevo-api-key',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@techwork.events',
    toEmail: process.env.BREVO_TO_EMAIL || 'privacy@techwork.events',
    replyToEmail: process.env.BREVO_REPLY_TO_EMAIL || 'privacy@techwork.events',
    senderName: "Tech'Work Lyon",
    newsletterListId: 2, // ID de la liste newsletter
}
// Initialiser Brevo API
exports.brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
exports.brevoApiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, exports.brevoConfig.apiKey)
// Configuration CORS
exports.corsHandler = (0, cors_1.default)({
    origin: [
        'https://techwork.events',
        'https://www.techwork.events',
        'https://techwork-2026-website.web.app',
        'https://techwork-2026-website.firebaseapp.com',
        'http://localhost:4321',
        'http://localhost:3000',
        'http://127.0.0.1:4321',
    ],
    credentials: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
})
//# sourceMappingURL=index.js.map

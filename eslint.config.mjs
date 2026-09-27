export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**'
    ]
  },
  {
    files: ['js/**/*.js', 'serve.js', 'sw.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        speechSynthesis: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        BroadcastChannel: 'readonly',
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        Buffer: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        performance: 'readonly',
        alert: 'readonly',
        Event: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        // In-browser modular singletons shared across script tags
        StateStore: 'readonly',
        StorageVault: 'readonly',
        AudioEngine: 'readonly',
        ModalManager: 'readonly',
        AppController: 'readonly',
        TimerEngine: 'readonly',
        VoiceAssistant: 'readonly',
        DiagnosticsEngine: 'readonly',
        GenerativeRAG: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-constant-condition': 'warn',
      'no-empty': 'off'
    }
  }
];

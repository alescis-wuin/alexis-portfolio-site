const browserGlobals = {
  AbortController: 'readonly',
  AbortSignal: 'readonly',
  Blob: 'readonly',
  CustomEvent: 'readonly',
  DOMParser: 'readonly',
  Element: 'readonly',
  Event: 'readonly',
  EventTarget: 'readonly',
  HTMLAnchorElement: 'readonly',
  HTMLButtonElement: 'readonly',
  HTMLElement: 'readonly',
  IntersectionObserver: 'readonly',
  KeyboardEvent: 'readonly',
  Map: 'readonly',
  Node: 'readonly',
  ResizeObserver: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  WheelEvent: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  getComputedStyle: 'readonly',
  history: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  matchMedia: 'readonly',
  navigator: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly'
};

const nodeGlobals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly'
};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**'
    ]
  },
  {
    files: ['assets/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals
    },
    rules: {
      'eqeqeq': ['error', 'smart'],
      'no-alert': 'error',
      'no-console': 'off',
      'no-implicit-globals': 'error',
      'no-redeclare': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-const': 'warn'
    }
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'playwright.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals
    },
    rules: {
      'eqeqeq': ['error', 'smart'],
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      'no-var': 'error',
      'prefer-const': 'warn'
    }
  }
];

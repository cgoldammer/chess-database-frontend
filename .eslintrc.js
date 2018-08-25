module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
  ],
  'rules': {
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'comma-style': ['error', 'last'],
    'comma-dangle': ['error', 'always'],
    'max-len': ['error', {'code': 90}],
    'object-curly-spacing': ["error", "never"],
    'react/jsx-uses-vars': 'error',
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-curly-spacing': ['error', {'when': 'never'}]
  },
  'globals': {
    'process': true,
    'require': true,
    'global': true,
    'expect': true,
    'test': true,
    'shallow': true,
    'mount': true,
    'render': true,
  },
};

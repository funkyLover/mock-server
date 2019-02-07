module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: ['prettier', 'prettier/standard'],
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true
  },
  globals: {
    jest: true,
    test: true,
    expect: true
  },
  rules: {
    'prettier/prettier': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'generator-star-spacing': 'off',
    eqeqeq: ['error', 'always'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: 'should',
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true
      }
    ]
  }
};

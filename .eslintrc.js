module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['build', 'generated', 'webpack.config.js'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};

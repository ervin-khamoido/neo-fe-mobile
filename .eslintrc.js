module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-explicit-any': [0],
    semi: [2, 'never'],
    '@typescript-eslint/no-unused-vars': [1],
  },
  ignorePatterns: ['dist/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-dupe-class-members': 'off',
      },
    },
  ],
}

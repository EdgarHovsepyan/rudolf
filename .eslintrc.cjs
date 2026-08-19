module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // Проект на JS без TypeScript: пропсы документированы по месту, prop-types не используем
    'react/prop-types': 'off',
    // Не-DOM атрибуты, которые встречаются и в обычной разметке
    'react/no-unknown-property': ['error', { ignore: ['inert', 'fetchPriority'] }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Сцена на react-three-fiber: <mesh>, <meshPhysicalMaterial> и их пропсы —
      // это three.js, а не DOM, поэтому правило про неизвестные атрибуты здесь неприменимо.
      files: [
        'src/components/Scene/**',
        'src/components/Model/**',
        'src/components/BackgroundText/**',
        'src/components/Rain/**',
        'src/components/Effects/**',
      ],
      rules: { 'react/no-unknown-property': 'off' },
    },
  ],
}

//eslint no
module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": "commonjs"
      }
    ]
  ],
  "plugins": [
    "styled-components",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-dynamic-import",
    "dynamic-import-node-sync"
  ]
}
// this file will be used by default by babel@7 once it is released
module.exports = () => {
  return {
    "plugins": [
      "syntax-flow",
      "transform-decorators-legacy",
      "transform-flow-strip-types"
    ],
    "presets": [
      [
        "env", {
          "targets": process.env.BABEL_TARGET === 'node' ? {
            "node": process.env.IN_PROTRACTOR ? '6' : 'current'
          } : {
            "browsers": [ "last 2 versions" ]
          },
          "loose": true,
          "modules": process.env.BABEL_TARGET === 'node' ? 'commonjs' : false
        }
      ],
      "stage-1"
    ]
  }
}

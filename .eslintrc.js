module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true,
        "mocha": true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-multiple-empty-lines": [
            "error",
            { "max": 1, "maxEOF": 1 }
        ],
        // "keyword-spacing": ["error", {
        // "before": false, "after": false, "overrides": {
        // "if": { "before": true, "after": true },
        // "else": { "before": true, "after": true },
        // "try": { "before": true, "after": true },
        // "catch": { "before": true, "after": false },
        // "const": { "before": true, "after": true }
        // }
        // }],
        // "space-before-function-paren": ["error", "never"],
        // "space-before-blocks": ["error", "never"],
        "operator-assignment": ["error", "never"],
        "spaced-comment": ["error", "always", { "exceptions": ["*"], "block": { "balanced": true } }],
        // "comma-dangle": ["error", "never"],
        "semi": 0,
        "comma-dangle": 0,
        "no-useless-escape": 0,
        "no-console": 0,
        "no-unused-vars": 0,
        "no-undef": 0,
        "no-redeclare": 0,
        "no-unreachable": 0
    }
};
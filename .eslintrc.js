module.exports = {
    "extends": "airbnb-base",
    "rules": {
      "prefer-promise-reject-errors": ["warn", {"allowEmptyReject": true}],
      "func-names": ["error", "never"],
      // "promise/catch-or-return": "error",
    }
};

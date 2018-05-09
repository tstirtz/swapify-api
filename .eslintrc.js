module.exports = {
    "extends": "airbnb-base",
    "rules": {
      "prefer-promise-reject-errors": ["error", {"allowEmptyReject": true}],
      "func-names": ["error", "never"],
      // "promise/catch-or-return": "error",
    }
};

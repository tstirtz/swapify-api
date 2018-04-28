exports.PORT = process.env.PORT || 8000;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://swapify.netlify.com/';
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/swapify';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-swapify';

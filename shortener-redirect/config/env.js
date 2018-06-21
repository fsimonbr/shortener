var path = require('path')
  , cors = require('cors')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override');

module.exports = function (express, app) {
  __dirname = app.get('__dirname');

  // Middleware
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
};

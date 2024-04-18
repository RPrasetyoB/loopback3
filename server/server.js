const loopback = require('loopback');
const boot = require('loopback-boot');
const passport = require('passport');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = module.exports = loopback();

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
  });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.enableAuth();

app.use(passport.initialize());
app.use(passport.session());

boot(app, __dirname, function(err) {
  if (err) throw err;

  require('./boot/customer')(app);
  require('./boot/order')(app);

  if (require.main === module)
    app.start();
});

module.exports = app;

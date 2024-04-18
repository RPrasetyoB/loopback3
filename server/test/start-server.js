module.exports = function() {
 return new Promise((resolve, reject) => {
    if (app.loaded) {
      app.once('started', resolve);
      app.start();
    } else {
      app.once('loaded', function() {
        app.once('started', resolve);
        app.start();
      });
    }
 });
};

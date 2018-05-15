const fs = require('fs');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const exists = Promise.promisify(fs.stat);

const loadBundle = function(cache, item, filename) {
  setTimeout(() => {
    console.log('loading:', filename);
    cache[item] = require(filename).default;    
  }, 0);
};

const fetchBundles = (path, services, suffix = '', require = false) => {
  Object.keys(services).forEach(((item) => {
    const ext = suffix.includes('style') ? '.css' : '.js';
    const filename = `${path}/${item}${suffix}${ext}`;
    exists(filename)
      .then(() => {
        require ? loadBundle(services, item, filename) : null;
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          const url = `${services[item]}${suffix}${ext}`;
          fetch(url)
            .then((res) => {
              const dest = fs.createWriteStream(filename);
              res.body.pipe(dest);
              res.body.on('end', () => {
                require ? loadBundle(services, item, filename) : null;
              });
            });
        } else {
          console.log('WARNING: Unknown fs error');
        }
      });
  }));
};

module.exports = (clientPath, serverPath, cssPath, services) => {
  fetchBundles(clientPath, services);
  fetchBundles(serverPath, services, '-server', true);
  //fetchBundles(cssPath, services, '-style', true);
  return services;
};

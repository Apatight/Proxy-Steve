const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const clientBundles = './public/services';
const serverBundles = './templates/services';
const cssBundles = './public/services';
const serviceConfig = require('./service-config.json');
const services = require('./loader.js')(clientBundles, serverBundles, cssBundles, serviceConfig);

const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');

// see: https://medium.com/styled-components/the-simple-guide-to-server-side-rendering-react-with-styled-components-d31c6b2b8fbf
const renderComponents = (components, props = {}) => {
  return Object.keys(components).map((item) => {
    const component = React.createElement(components[item], props);
    return ReactDom.renderToString(component);
  });
};

app.get('/restaurants/:id', (req, res) => {
  const components = renderComponents(services, { place_id: req.params.id });
  res.end(Layout(
    'SDC Demo',
    App(...components),
    Scripts(Object.keys(services)),
  ));
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});
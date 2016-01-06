import superagent from 'superagent';
import config from '../config';

const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(api, path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  console.log(`server ${path}`);
  if (__SERVER__) {
    console.log(`server ${api}`);
    console.log(`adjusted path ${adjustedPath}`);
    // Prepend host and port of the API server to the path.
    return 'http://' + config.api[api].host + ':' + config.api[api].port + adjustedPath;
  }

  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api/${api}${adjustedPath}`;
}

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
class _ApiClient {
  constructor(req) {
    methods.forEach((method) =>
      this[method] = (api, path, { params, data } = {}) => new Promise((resolve, reject) => {
        console.log(`API api ${api}`);
        console.log(`API client ${path}`);
        const value = formatUrl(api, path);
        console.log(value);
        const request = superagent[method](value);

        if (params) {
          request.query(params);
        }

        if (__SERVER__ && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));

        }

        if (data) {
          request.send(data);
        }

        request.set('X-Vault-Token', config.vaultToken);

        request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      }));
  }
}

const ApiClient = _ApiClient;

export default ApiClient;

import fetchMock from 'fetch-mock';


const sandbox = fetchMock.sandbox();

globalThis.fetch = sandbox;
Object.assign(fetchMock.config, {
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
  fetch: sandbox,
});

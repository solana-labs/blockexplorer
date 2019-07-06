import localforage from 'localforage';
import {parse as urlParse, format as urlFormat} from 'url';

const urlMap = {
  local: `http://${window.location.hostname}:8899`,
  'testnet-edge': 'http://edge.testnet.solana.com:8899',
  'testnet-beta': 'http://beta.testnet.solana.com:8899',
  testnet: 'http://testnet.solana.com:8899',
  /*
  TODO: Switch to TLS endpoints...
  'testnet-edge': 'https://api.edge.testnet.solana.com',
  'testnet-beta': 'https://api.beta.testnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  */
};

let endpointName = process.env.NODE_ENV === 'development' ? 'local' : 'testnet';

export async function load() {
  try {
    const newEndpointName = await localforage.getItem('endpointName');
    if (typeof urlMap[newEndpointName] === 'string') {
      endpointName = newEndpointName;
    }
  } catch (err) {
    console.log(
      `Unable to load endpointName from localforage, using default of ${endpointName}: ${err}`,
    );
  }
  console.log('EndpointConfig loaded. endpointName:', endpointName);
}

export function getEndpointName() {
  return endpointName;
}

export function getEndpoints() {
  return Object.keys(urlMap);
}

export function setEndpointName(newEndpointName) {
  if (typeof urlMap[newEndpointName] !== 'string') {
    throw new Error(`Unknown endpoint: ${newEndpointName}`);
  }
  endpointName = newEndpointName;
  console.log('endpointName is now', endpointName);
  localforage.setItem('endpointName', endpointName).catch(err => {
    console.log(`Failed to set endpointName in localforage: ${err}`);
  });
}

export function getRpcUrl() {
  return urlMap[endpointName];
}

export function getApiUrl() {
  const urlParts = urlParse(getRpcUrl());
  urlParts.host = '';
  if (urlParts.protocol === 'https:') {
    urlParts.port = '3443';
  } else {
    urlParts.port = '3001';
  }
  const url = urlFormat(urlParts);
  console.info('getApiUrl:', url);
  return url;
}

export function getApiWebsocketUrl() {
  const urlParts = urlParse(getApiUrl());
  urlParts.host = '';
  if (urlParts.protocol === 'https:') {
    urlParts.protocol = 'wss:';
    urlParts.port = '3444';
  } else {
    urlParts.protocol = 'ws:';
  }
  const url = urlFormat(urlParts);
  console.info('getApiWebsocketUrl:', url);
  return url;
}

export function getMetricsDashboardUrl() {
  let matches;
  if (endpointName === 'local') {
    matches = window.location.hostname.match('([^.]*).testnet.solana.com');
  } else {
    const endpointUrl = urlMap[endpointName];
    matches = endpointUrl.match('([^.]*).testnet.solana.com');
  }

  let url =
    'https://metrics.solana.com:3000/d/testnet-beta/testnet-monitor-beta?refresh=5s&from=now-5m&to=now';
  if (matches) {
    const testnet = matches[1];
    url += `&var-testnet=testnet-${testnet}`;
  }
  console.log('getMetricsDashboardUrl:', url);
  return url;
}

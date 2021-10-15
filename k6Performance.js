import http from 'k6/http';
import { check, sleep } from 'k6';
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { generateXrayJUnitXML } from './junitXray.js'
import encoding from 'k6/encoding';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: [{threshold:'rate<0.01', abortOnFail: true, delayAbortEval: '10s'},],   // http errors should be less than 1% 
    http_req_duration: [{threshold:'p(90)<500', abortOnFail: true, delayAbortEval: '10s'},], // 90% of requests should be below 500ms
    http_reqs: [{threshold:'rate<100', abortOnFail: true, delayAbortEval: '10s'},] // http_reqs rate should be below 500ms
  },
};

export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');

  return {
      'stdout': textSummary(data, { indent: ' ', enableColors: true}), // Show the text summary to stdout...
      './junit.xml': jUnit(data), // but also transform it and save it as a JUnit XML...
      './summary.json': JSON.stringify(data), // and a JSON with all the details...
      './xrayJunit.xml': generateXrayJUnitXML(data, 'summary.json', encoding.b64encode(JSON.stringify(data))),
      // And any other JS transformation of the data you can think of,
      // you can write your own JS helpers to transform the summary data however you like!
  }
}

export default function () {
  const BASE_URL = 'http://blazedemo.com';

  const reserveParams = new URLSearchParams([
    ['fromPort', 'Paris'],
    ['toPort', 'Buenos+Aires'],
  ]);
  const purchaseParams = new URLSearchParams([
    ['fromPort', 'Paris'],
    ['toPort', 'Buenos+Aires'],
    ['airline', 'Virgin+America'],
    ['flight', '43'],
    ['price', '472.56']
  ]);

  let loginReq = {
    method: 'GET',
    url: BASE_URL+'/login',
  };

  let reserveReq = {
      method: 'POST',
      url: BASE_URL+'/reserve.php',
      params: {
        reserveParams,
      },
  };

  let purchaseReq = {
    method: 'POST',
    url: BASE_URL+'/purchase.php',
    params: {
      purchaseParams,
    },
  };

  let responses = http.batch([loginReq, reserveReq, purchaseReq]);
  
  check(responses, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

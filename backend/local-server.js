/**
 * Local server for debugging Find Record - run with: node local-server.js
 * Expose with ngrok: ngrok http 3000
 * Then temporarily set actionUrl to your ngrok URL + /api/find-record
 */
import http from 'http';
import fs from 'fs';

const DEBUG_ENDPOINT = 'http://127.0.0.1:7790/ingest/4f654b4b-d027-43ae-8949-efd104da3159';
const LOG_PATH = '/Users/shubhamnigam/Hubspot/hubspot-mcp-app/.cursor/debug-6de2e5.log';

function debugLog(location, message, data, hypothesisId) {
  const payload = JSON.stringify({
    sessionId: '6de2e5',
    location,
    message,
    data,
    hypothesisId,
    timestamp: Date.now(),
  }) + '\n';
  try {
    fs.appendFileSync(LOG_PATH, payload);
  } catch (_) {}
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '6de2e5' },
    body: JSON.stringify({ sessionId: '6de2e5', location, message, data, hypothesisId, timestamp: Date.now() }),
  }).catch(() => {});
}

async function handleRequest(req, body) {
  const { findRecord } = await import('./lib/find-record.js');
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  // #region agent log
  debugLog('local-server.js:handler-entry', 'Request received', {
    method: req.method,
    url: req.url,
    hasBody: !!body,
    bodyLength: body?.length,
  }, 'A');
  // #endregion

  if (req.method !== 'POST' || !req.url?.includes('find-record')) {
    return { status: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!accessToken) {
    debugLog('local-server.js:no-token', 'HUBSPOT_ACCESS_TOKEN missing', {}, 'E');
    return { status: 500, body: JSON.stringify({ outputFields: { found: 'false', hs_execution_state: 'FAIL_CONTINUE', error: 'Server configuration error' } }) };
  }

  let parsed;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body || '{}') : body || {};
  } catch (e) {
    debugLog('local-server.js:parse-error', 'Body parse failed', { error: String(e) }, 'D');
    return { status: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const inputFields = parsed.inputFields || parsed.fields || {};
  const objectType = inputFields.objectType || '';
  const searchProperty = inputFields.searchProperty || 'hs_object_id';
  const searchValue = String(inputFields.searchValue || '').trim();

  // #region agent log
  debugLog('local-server.js:inputFields', 'Extracted inputFields', {
    objectType,
    searchProperty,
    searchValue,
    rawKeys: Object.keys(inputFields),
  }, 'D');
  // #endregion

  const result = await findRecord({ accessToken, objectType, searchProperty, searchValue });

  const outputFields = {
    found: result.found,
    recordId: result.recordId,
    recordProperties: result.recordProperties,
    hs_execution_state: result.found === 'true' ? 'SUCCESS' : 'FAIL_CONTINUE',
  };
  if (result.error) outputFields.error = result.error;

  // #region agent log
  debugLog('local-server.js:result', 'findRecord result', { found: result.found, hasError: !!result.error }, 'C');
  // #endregion

  return { status: 200, body: JSON.stringify({ outputFields }) };
}

const server = http.createServer(async (req, res) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    try {
      const { status, body: responseBody } = await handleRequest(req, body);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(responseBody);
    } catch (err) {
      debugLog('local-server.js:handler-error', 'Unhandled error', { error: String(err) }, 'C');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Find Record backend running at http://localhost:${PORT}`);
  console.log(`Use ngrok http ${PORT} and set actionUrl to https://YOUR-NGROK-URL.ngrok-free.app/api/find-record`);
});

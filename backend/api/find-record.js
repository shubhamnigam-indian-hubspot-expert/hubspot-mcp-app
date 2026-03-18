import { validateHubSpotSignature } from '../lib/signature.js';
import { findRecord } from '../lib/find-record.js';

/**
 * HubSpot Find Record - Action endpoint
 * Receives workflow/agent execution requests and returns the found record
 */
export default async function handler(req, res) {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7790/ingest/4f654b4b-d027-43ae-8949-efd104da3159',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6de2e5'},body:JSON.stringify({sessionId:'6de2e5',location:'api/find-record.js:handler-entry',message:'Request received',data:{method:req?.method,hasBody:!!req?.body},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  } catch (_) {}
  // #endregion

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(500).json({
      outputFields: {
        found: 'false',
        recordId: '',
        recordProperties: '{}',
        hs_execution_state: 'FAIL_CONTINUE',
        error: 'Server configuration error',
      },
    });
  }

  // Validate signature if client secret is configured
  if (clientSecret) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const signatureHeader = req.headers['x-hubspot-signature'];
    const signatureVersion = req.headers['x-hubspot-signature-version'] || 'v2';

    const isValid = validateHubSpotSignature({
      clientSecret,
      method: req.method,
      url,
      body: rawBody,
      signatureHeader,
      signatureVersion,
    });

    if (!isValid) {
      console.error('Invalid HubSpot signature');
      return res.status(401).json({
        outputFields: {
          found: 'false',
          hs_execution_state: 'FAIL_CONTINUE',
          error: 'Invalid request signature',
        },
      });
    }
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const inputFields = body.inputFields || body.fields || {};

  const objectType = inputFields.objectType || '';
  const searchProperty = inputFields.searchProperty || 'hs_object_id';
  const searchValue = String(inputFields.searchValue || '').trim();

  const result = await findRecord({
    accessToken,
    objectType,
    searchProperty,
    searchValue,
  });

  const outputFields = {
    found: result.found,
    recordId: result.recordId,
    recordProperties: result.recordProperties,
    hs_execution_state: result.found === 'true' ? 'SUCCESS' : 'FAIL_CONTINUE',
  };

  if (result.error) {
    outputFields.error = result.error;
  }

  return res.status(200).json({ outputFields });
}

import { validateHubSpotSignature } from '../lib/signature.js';
import {
  fetchObjectTypes,
  fetchSearchProperties,
  formatOptionsResponse,
} from '../lib/options.js';

/**
 * HubSpot Find Record - Options endpoint (Phase 2)
 * Provides dynamic dropdown options for objectType and searchProperty fields
 * @see https://developers.hubspot.com/docs/api-reference/automation-actions-v4-v4/custom-action-reference#using-external-data
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(500).json({ options: [], searchable: false });
  }

  if (clientSecret) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;
    const rawBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

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
      console.error('Invalid HubSpot signature on options request');
      return res.status(401).json({ options: [] });
    }
  }

  const body =
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const inputFieldName = body.inputFieldName || '';
  const inputFields = body.inputFields || {};
  const fetchOptions = body.fetchOptions || {};
  const q = (fetchOptions.q || '').toLowerCase().trim();

  let options = [];

  if (inputFieldName === 'objectType') {
    options = await fetchObjectTypes(accessToken);
  } else if (inputFieldName === 'searchProperty') {
    const objectType = inputFields.objectType || '';
    options = await fetchSearchProperties(accessToken, objectType);
  }

  if (q) {
    options = options.filter(
      (o) =>
        (o.label || '').toLowerCase().includes(q) ||
        (o.value || '').toLowerCase().includes(q)
    );
  }

  return res.status(200).json(formatOptionsResponse(options));
}

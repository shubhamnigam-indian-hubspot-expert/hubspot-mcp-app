import crypto from 'crypto';

/**
 * Validate HubSpot request signature (v2 or v3)
 * @see https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation
 */
export function validateHubSpotSignature({
  clientSecret,
  method,
  url,
  body,
  signatureHeader,
  signatureVersion = 'v2',
  timestampHeader,
}) {
  if (!clientSecret || !signatureHeader) {
    return false;
  }

  if (signatureVersion === 'v3' || signatureHeader.includes('.')) {
    // v3 format: signature.timestamp
    const [signature, timestamp] = signatureHeader.split('.');
    if (!timestamp) return false;

    const MAX_ALLOWED_TIMESTAMP = 300000; // 5 minutes
    if (Date.now() - parseInt(timestamp, 10) > MAX_ALLOWED_TIMESTAMP) {
      return false;
    }

    const rawString = method + url + (body || '') + timestamp;
    const expectedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(rawString)
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  }

  // v2 format
  const sourceString = clientSecret + method + url + (body || '');
  const expectedHash = crypto
    .createHash('sha256')
    .update(sourceString, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(signatureHeader, 'hex')
  );
}

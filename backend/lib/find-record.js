const HUBSPOT_API_BASE = 'https://api.hubapi.com';

/**
 * Find a HubSpot CRM record by unique identifier
 * @param {Object} params
 * @param {string} params.accessToken - HubSpot private app access token
 * @param {string} params.objectType - e.g. contacts, companies, deals
 * @param {string} params.searchProperty - e.g. email, hs_object_id, domain
 * @param {string} params.searchValue - The value to search for
 * @returns {Promise<{recordId: string, recordProperties: string, found: string}>}
 */
export async function findRecord({
  accessToken,
  objectType,
  searchProperty,
  searchValue,
}) {
  if (!objectType || !searchProperty || !searchValue) {
    return {
      found: 'false',
      recordId: '',
      recordProperties: '{}',
      error: 'Missing required fields: objectType, searchProperty, searchValue',
    };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    // For hs_object_id, use direct GET; otherwise use idProperty
    if (searchProperty === 'hs_object_id') {
      const url = `${HUBSPOT_API_BASE}/crm/v3/objects/${objectType}/${searchValue}`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        if (res.status === 404) {
          return { found: 'false', recordId: '', recordProperties: '{}' };
        }
        const errText = await res.text();
        throw new Error(`HubSpot API error: ${res.status} ${errText}`);
      }

      const record = await res.json();
      return formatRecordResponse(record);
    }

    // Use idProperty for other unique identifiers (email, domain, etc.)
    const url = `${HUBSPOT_API_BASE}/crm/v3/objects/${objectType}/${encodeURIComponent(searchValue)}?idProperty=${searchProperty}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 404) {
        return { found: 'false', recordId: '', recordProperties: '{}' };
      }
      // Fallback to Search API for properties that don't support idProperty
      return await findRecordBySearch({
        accessToken,
        objectType,
        searchProperty,
        searchValue,
      });
    }

    const record = await res.json();
    return formatRecordResponse(record);
  } catch (err) {
    console.error('Find record error:', err);
    return {
      found: 'false',
      recordId: '',
      recordProperties: '{}',
      error: err.message || 'Failed to find record',
    };
  }
}

/**
 * Fallback: search by filter when idProperty lookup fails
 */
async function findRecordBySearch({
  accessToken,
  objectType,
  searchProperty,
  searchValue,
}) {
  const url = `${HUBSPOT_API_BASE}/crm/v3/objects/${objectType}/search`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: searchProperty,
              operator: 'EQ',
              value: searchValue,
            },
          ],
        },
      ],
      limit: 1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HubSpot Search API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const record = data.results?.[0];

  if (!record) {
    return { found: 'false', recordId: '', recordProperties: '{}' };
  }

  return formatRecordResponse(record);
}

function formatRecordResponse(record) {
  const recordId = String(record.id || '');
  const recordProperties = JSON.stringify(record.properties || {});
  return {
    found: 'true',
    recordId,
    recordProperties,
  };
}

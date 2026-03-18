const HUBSPOT_API_BASE = 'https://api.hubapi.com';

const STANDARD_OBJECTS = [
  { value: 'contacts', label: 'Contact', description: 'Individual person' },
  { value: 'companies', label: 'Company', description: 'Business or organization' },
  { value: 'deals', label: 'Deal', description: 'Sales opportunity' },
  { value: 'tickets', label: 'Ticket', description: 'Support ticket' },
  { value: 'leads', label: 'Lead', description: 'Potential customer' },
  { value: 'products', label: 'Product', description: 'Product or service' },
  { value: 'quotes', label: 'Quote', description: 'Sales quote' },
  { value: 'line_items', label: 'Line Item', description: 'Deal line item' },
];

const COMMON_SEARCH_PROPERTIES = [
  { value: 'hs_object_id', label: 'Record ID (hs_object_id)', description: 'Unique numeric ID' },
  { value: 'email', label: 'Email', description: 'Email address' },
  { value: 'domain', label: 'Domain', description: 'Company domain' },
];

/**
 * Fetch object types (standard + custom) for the objectType dropdown
 */
export async function fetchObjectTypes(accessToken) {
  const options = [...STANDARD_OBJECTS];

  const schemaEndpoints = [
    `${HUBSPOT_API_BASE}/crm/v3/schemas`,
    `${HUBSPOT_API_BASE}/crm-object-schemas/v3/schemas`,
  ];

  for (const url of schemaEndpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const schemas = data.results || data.objects || [];
        const customObjects = schemas.map((schema) => ({
          value: schema.name || schema.id || schema.objectTypeId,
          label: schema.label || schema.displayName || schema.name || schema.id,
          description: schema.description || 'Custom object',
        }));
        options.push(...customObjects);
        break;
      }
    } catch (err) {
      console.warn('Schema fetch failed for', url, err.message);
    }
  }

  return options;
}

/**
 * Fetch searchable/unique properties for an object type
 */
export async function fetchSearchProperties(accessToken, objectType) {
  if (!objectType) {
    return COMMON_SEARCH_PROPERTIES;
  }

  const options = [...COMMON_SEARCH_PROPERTIES];

  try {
    const res = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/properties/${objectType}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const uniqueProps = (data.results || [])
        .filter((p) => p.hasUniqueValue === true)
        .filter((p) => !options.some((o) => o.value === p.name))
        .map((p) => ({
          value: p.name,
          label: p.label || p.name,
          description: p.description || p.name,
        }));
      options.push(...uniqueProps);
    }
  } catch (err) {
    console.warn('Could not fetch properties for', objectType, err.message);
  }

  return options;
}

/**
 * Format options for HubSpot optionsUrl response
 */
export function formatOptionsResponse(options, { searchable = true, after } = {}) {
  const response = { options };
  if (searchable) response.searchable = true;
  if (after) response.after = after;
  return response;
}

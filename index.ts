/**
 * Validate a GUID string in the common Windows form:
 * 8-4-4-4-12 hex, optionally wrapped in { }.
 *
 * Does NOT enforce RFC 4122 variant/version rules.
 */
function validateWindowsGuidString(input: string): boolean {
  const s = input.startsWith('{') && input.endsWith('}')
    ? input.slice(1, -1)
    : input;

  // Accept uppercase/lowercase, strict hyphen positions
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);
}

export function parseWindowsGuid(uuid: string): Uint8Array {
  // Allow "{...}" common in Windows GUID formatting
  uuid = uuid.startsWith('{') && uuid.endsWith('}')
    ? uuid.slice(1, -1)
    : uuid;

  if (!validateWindowsGuidString(uuid)) {
    throw TypeError('Invalid GUID format');
  }

  let v;

  // Same slicing as uuidjs.parse, but swap endianness for the first 3 fields:
  return Uint8Array.of(
    // Data1: ........-....-....-....-............
    // little-endian uint32
    (v = parseInt(uuid.slice(0, 8), 16)) & 0xff,
    (v >>> 8) & 0xff,
    (v >>> 16) & 0xff,
    (v >>> 24) & 0xff,

    // Data2: ........-####-....-....-............
    // little-endian uint16
    (v = parseInt(uuid.slice(9, 13), 16)) & 0xff,
    (v >>> 8) & 0xff,

    // Data3: ........-....-####-....-............
    // little-endian uint16
    (v = parseInt(uuid.slice(14, 18), 16)) & 0xff,
    (v >>> 8) & 0xff,

    // Data4: ........-....-....-####-############
    // as-is (big-endian within each parsed group, but we’ll write bytes in string order)
    (v = parseInt(uuid.slice(19, 23), 16)) >>> 8,
    v & 0xff,

    // last 12 hex chars, 6 bytes, as-is
    ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff,
    (v / 0x100000000) & 0xff,
    (v >>> 24) & 0xff,
    (v >>> 16) & 0xff,
    (v >>> 8) & 0xff,
    v & 0xff
  );
}

parseWindowsGuid('49C1577D-2CB7-41BB-1CF3-08D960A71AAF');
export function uint8ArrayToHexString(uint8Array: Uint8Array): `0x${string}` {
  let hexString = Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  hexString = hexString.replace(/^(00)+/, '');

  return ('0x' + hexString) as `0x${string}`;
}

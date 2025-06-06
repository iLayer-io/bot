import { zeroPadValue } from 'ethers';

export const pad32 = (value: `0x${string}`): `0x${string}` =>
    zeroPadValue(value, 32) as `0x${string}`;

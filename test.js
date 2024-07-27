import { unixfs } from '@helia/unixfs';
import { startHelia } from './src/ipfs.js';
// start helia for ipfs connection
const helia = await startHelia();
const fs = unixfs(helia);

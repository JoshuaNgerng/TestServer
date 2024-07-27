import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Helia } from 'helia'
import { UnixFS, unixfs } from '@helia/unixfs'
import { CID } from 'multiformats/cid'
import { startHelia, uploadToIPFS, getFileFromIPFS, logLibp2pInfo } from './src/ipfs.js'
import { logtext, writeLocalFile } from './src/local.js'
import { checkFileType } from './src/validator.js'

// start helia for ipfs connection
const helia: Helia = await startHelia();
const fs: UnixFS = unixfs(helia);
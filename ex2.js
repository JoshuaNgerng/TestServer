import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { bootstrap } from '@libp2p/bootstrap';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import fs_ from 'fs';
async function startHelia(config = {}) {
    const blockstore = new MemoryBlockstore();
    const datastore = new MemoryDatastore();
    const bootstrapList = [
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
    ];
    const libp2p = await createLibp2p({
        addresses: {
            listen: [
                '/ip4/127.0.0.1/tcp/0',
            ]
        },
        transports: [
            tcp()
        ],
        connectionEncryption: [
            noise()
        ],
        streamMuxers: [
            yamux()
        ],
        peerDiscovery: [
            bootstrap({
                list: bootstrapList
            })
        ],
        datastore,
        ...config
    });
    const helia = await createHelia({
        libp2p,
        blockstore,
        datastore,
        start: true
    });
    return (helia);
}
const helia = await startHelia();
const fs = unixfs(helia);
export function writeLocalFile(text, filepath) {
    fs_.writeFileSync(filepath, text, { 'flag': 'w' });
}
// create an empty dir and a file, then add the file to the dir
const emptyDirCid = await fs.addDirectory();
const fileCid = await fs.addBytes(Uint8Array.from([0, 1, 2, 3]));
const updateDirCid = await fs.cp(fileCid, emptyDirCid, 'foo.txt');
// or doing the same thing as a stream
for await (const entry of fs.addAll([{
        path: 'foo.txt',
        content: Uint8Array.from([0, 1, 2, 3])
    }])) {
    console.info(entry);
}
let text_list = [];
for await (const chunk of fs.cat(updateDirCid)) {
    text_list.push(chunk);
}
const data = new Uint8Array(text_list.reduce((acc, chunk) => acc + chunk.length, 0));
let offset = 0;
for (const chunk of text_list) {
    data.set(chunk, offset);
    offset += chunk.length;
}
writeLocalFile(data, 'test');

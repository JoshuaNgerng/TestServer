import { createHelia, HeliaLibp2p } from 'helia'
import { UnixFS } from '@helia/unixfs'
import { createLibp2p, Libp2pOptions, Libp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { bootstrap } from '@libp2p/bootstrap';
import type { PeerId } from '@libp2p/interface'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import type { Helia } from '@helia/interface'
import { CID } from 'multiformats/cid'
import { Multiaddr } from '@multiformats/multiaddr'
import { join } from 'path'
import JSZip, { file } from 'jszip'
import { file_t } from '../server.js';
import { createAsyncIterableWithTimeout, TimeoutError } from './timeout.js'
import { logtext } from './local.js'

const zip = new JSZip();

export async function startHelia (config: Libp2pOptions = {}): Promise<Helia> {
	const blockstore = new MemoryBlockstore()
	const datastore = new MemoryDatastore()
	const bootstrapList = [
		'/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
		'/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
		'/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
		'/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
	]

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

export interface file {
	name: string;
	content: Uint8Array;
}

async function createZipArchive(files: file[]): Promise<Uint8Array> {

	files.forEach((file) => {
		zip.file(file.name, file.content);
	});
	const content = await zip.generateAsync({ type: 'uint8array' });
	return content;
}

export async function unzipFile(zipFile: Uint8Array) : Promise<file[]> {
	let outFiles: file[] = [];
	zip.loadAsync(zipFile).then( (zipContent) => {
		Object.keys(zipContent.files).forEach( (filename) => {
			zip.files[filename].async('uint8array').then( (content) => {
				outFiles.push({ name: filename, content: content });
			})
		})
	})
	return (outFiles);
}

// dont know how to handle error if addBytes failed lulz
export async function uploadToIPFS( fs: UnixFS, data: Express.Multer.File, meta: file_t) : Promise<CID> {
	const zipfile = await createZipArchive([
		{name: meta.name, content: meta.content},
		{name: data.originalname, content:Uint8Array.from(data.buffer) }
	]);
	const cid = await fs.addBytes(zipfile);
	return (cid);
}

export async function getFileFromIPFS( fs: UnixFS, cid: string ) : Promise<[Uint8Array | null, number, string]> {
	const filePath: string = join('downloads/' + cid);

	try {
		const cid_: CID = CID.parse(cid);
		const chunks: AsyncIterable<Uint8Array> = createAsyncIterableWithTimeout(fs.cat(cid_), 10000)
		let text_list: Uint8Array[] = [];
		for await(const chunk of chunks) {
			text_list.push(chunk);
		}
		const data: Uint8Array = new Uint8Array(text_list.reduce((acc, chunk) => acc + chunk.length, 0));
		let offset = 0;
		for (const chunk of text_list) {
			data.set(chunk, offset);
			offset += chunk.length;
			}
			return ([data, 201, "File sucessfully loaded"]);
		}
	catch (err) {
		if (err instanceof TimeoutError)
			return ([null, 404, "File Not Found"]);
	}
	return ([null, 502, "Unknown error"]);
}

interface CheckHelia extends Helia {
	libp2p: Libp2p;
}

export function getLibp2pInfo( helia: Helia ): [PeerId, Multiaddr[]] {
	return ([(helia as CheckHelia).libp2p.peerId, (helia as CheckHelia).libp2p.getMultiaddrs()]);
}

export function logLibp2pInfo( helia: Helia, logfile: string ) : void {
	logtext(`helia libp2p id is ${(helia as CheckHelia).libp2p.peerId.toString()}`, logfile);
	(helia as CheckHelia).libp2p.getMultiaddrs().forEach( (addr: Multiaddr) => {
		logtext(`connected to ${addr.toString()}`, logfile);
	});
}

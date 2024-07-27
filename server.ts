import express, { Express, Request, Response } from 'express'
import multer, { Multer } from 'multer'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Helia } from 'helia'
import { UnixFS, unixfs } from '@helia/unixfs'
import { CID } from 'multiformats/cid'
import { startHelia, uploadToIPFS, getFileFromIPFS, unzipFile } from './src/ipfs.js'
import { checkFileType } from './src/validator.js'
import { logtext, writeLocalFile } from './src/local.js'

// setup for server
const app: Express = express();
const upload: Multer = multer({ storage: multer.memoryStorage() })
const port: string = process.env.PORT || '6969';
const launchdir: string = join(dirname(fileURLToPath(import.meta.url)) + '/public');

// start helia for ipfs connection
const helia: Helia = await startHelia();
const fs: UnixFS = unixfs(helia);
const logfile: string = 'log.txt';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface file_t {
	name: string;
	content: Uint8Array;
}

interface account {
	type: string;
	name: string;
}

let acc = { type: "publisher", name: "Sunway University" };

function make_account_meta(acc: account): file_t {
	let content = join( 'publisher_name: ' + acc.name + '\n' +
		'data_of_published: ' + new Date().toISOString().split("T")[0] + '\n'
	 );
	return {name:"meta", content: encoder.encode(content)};
}

function parse_json(meta: file_t, content: file_t) {
	let name: string = '';
	let date: string = '';
	let items = decoder.decode(meta.content).split(' \n');
	for (let index = 0; index < items.length; index ++) {
		if (items[index] == 'publisher_name:')
			name = items[index + 1];
		else if (items[index] == 'data_of_published:')
			date = items[index + 1];
	}
	return ([name, content.name, date]);
}

app.use('/', express.static(join(launchdir)));

app.get('/upload', (req: Request, res: Response) => {
	res.sendFile(join(launchdir, '/upload_files.html'));
});

app.get('/about.html', (req: Request, res: Response) => {
	res.sendFile(join(launchdir, '/about.html'));
});

app.post('/upload', upload.any(), async (req: Request, res: Response) => {
	if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
		return (res.status(400).send('No file uploaded to server.'));
	}
	let check : boolean = true;
	for (const file of (req.files as Express.Multer.File[])) {
		const filetype: number = checkFileType(file.buffer);
		if (filetype < 0) {
			check = false;
			continue ;
		}
		const cid: CID = await uploadToIPFS(fs, file, make_account_meta(acc));
		logtext(`file ${req.file?.originalname} as ${cid}`, 'log.txt');
	}
	if (check == false)
		return (res.status(404).send(`Some Files have unideftiable format`));
	res.status(201).send(`All files sucessfully uploaded`);
});

app.post('/download', upload.none(), async (req : Request, res: Response) => {
	if (!req.body) {
		return (res.status(404).send('No CID received'));
	}
	const info: [Uint8Array | null, number, string] = await getFileFromIPFS(fs, req.body.filename);
	if (!info[0]) {
		return (res.status(info[1]).send(info[2]));
	}
	const fileType = checkFileType(info[0])
	if (fileType != 0) {
		return (res.status(404).send('Unknown File received from ipfs'));
	}
	let files = await unzipFile(info[0]);
	if (files[0].name != "meta") {
		return (res.status(404).send('Publisher infomation missing'));
	}
	if (checkFileType(files[1].content) < 0) {
		return (res.status(404).send('Unindetifiable File received from packet'));
	}
	let msg = parse_json(files[0], files[1]);
	writeLocalFile(files[1].content, files[1].name);
	res.status(201).send(msg);
});

app.use((req : Request, res : Response) => {
	console.log(`Invalid request: ${req.method} ${req.originalUrl}`);
	res.status(404).send(`<h1>Error 404: Request not found</h1>`);
});

app.listen(parseInt(port), async() =>  {
	console.log(`App is ready and listening on http://localhost:${port}`);
	// logtext('New server session', logfile);
	// logLibp2pInfo(helia, logfile);
});

process.on('SIGINT', () => {
	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
	helia.stop();
	process.exit();
});

export default app

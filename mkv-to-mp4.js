const fs = require("fs");
const { exec } = require("child_process");
const { join } = require("path");
const { exit } = require("process");

let argPointer = 2;
let sourceDir = "";
let delay = 0;
while (argPointer < process.argv.length) {
	switch (process.argv[argPointer]) {
		default: sourceDir = process.argv[argPointer] ; break;
		case '-d':
		case '--delay':
			delay = parseInt(process.argv[++argPointer]);
			break;
		case '-h':
		case '--hour-delay':
			delay = parseFloat(process.argv[++argPointer]) * 60 * 60;
			break;
	}
	argPointer++;
}
if (delay > 0) {
	console.log(`Waiting ${delay} Seconds.`);
}
setTimeout(() => {
	fs.readdir(sourceDir, async (err, files) => {
		if (err) {
			console.log("Error: " + err);
			exit(0);
		};
	
		const mp4dir = join(sourceDir, 'mp4');
		if (fs.existsSync(mp4dir)) {
			const files = await new Promise((resolve, reject) => {
				fs.readdir(mp4dir, (err, files) => {
					if (err) reject(err);
					resolve(files);
				})
			});
			const lastfile = files[files.length - 1];
			if (lastfile.includes(".mp4")) {
				fs.unlink(join(mp4dir, lastfile), () => {});
			}
		}
		else fs.mkdir(mp4dir, () => {})
	
		for (const file of files) {
			const source = join(sourceDir, file);
			const target = join(mp4dir, file.replace('mkv','mp4'));
			const cmd = `ffmpeg -y -hide_banner -loglevel error -i "${source}" "${target}"`;
			console.log(cmd);
			if (fs.existsSync(target)) {
				console.log("Exists, Next...");
				continue;
			}
			console.log(await new Promise((resolve,reject) => exec(cmd, (e, stdout, stderr) => {
				if (e) reject(e);
				resolve(stdout + stderr);
			})));
		}
	});
}, delay * 1000)

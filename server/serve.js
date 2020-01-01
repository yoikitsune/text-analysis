const { spawn } = require('child_process');
const path = require ("path");
const fs = require("fs");

const exec = function (command, params, handler) {
	const node = spawn(command, params , {stdio:'inherit'});
	node.on('close', (code) => {
		console.log(`${command} child process exited with code ${code}`);
		handler && handler ();
	});
}

require('http-server')
	.createServer({root:"./dist/"})
	.listen(8080, "127.0.0.1", function () {
		exec ('node', ["server/index.js"])
		exec ('/usr/local/bin/webpack', ["--watch"]);
		let hasChanged = false;
		fs.watch('./server', function (e, f) {
			console.log (e, f);
			if (!hasChanged) {
				hasChanged = true;
				setTimeout (() => {
					if (path.extname(f) == ".js") {
						exec ('node', ["index.js"], () => {
							hasChanged = false;
						})
					}
				}, 800);
			}
		});
	});

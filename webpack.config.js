const webpack = require("webpack");
const rxPaths = require('rxjs/_esm5/path-mapping');
const path = require("path");
const fs = require("fs");
const { spawn } = require('child_process');
const exec = function (command, params, handler) {
	const node = spawn(command, params , {stdio:'inherit'});
	node.on('close', (code) => {
		console.log(`${command} child process exited with code ${code}`);
		handler && handler ();
	});
}

let config = {
  mode: 'development',
  entry: "./client/index.js",
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  resolve: {
    // Use the "alias" key to resolve to an ESM distribution
    alias: rxPaths()
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use : {
          loader: "babel-loader",
          options : {
            "plugins": ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 8080,
      hot : true,
      onListening: function(server) {
        exec ('node', ["server/index.js"])
        let hasChanged = false;
    		fs.watch('./server', function (e, f) {
    			console.log (e, f);
    			if (!hasChanged) {
    				hasChanged = true;
    				setTimeout (() => {
    					if (path.extname(f) == ".js") {
    						exec ('node', ["server/index.js"], () => {
    							hasChanged = false;
    						})
    					}
    				}, 800);
    			}
    		});
      }
  }
}

module.exports = config;

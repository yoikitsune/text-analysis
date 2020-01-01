var fs = require("fs");
var Parser = require ("./includes");
var chapters = {};
var level = 1;

fs.readFile(__dirname + "/module1.txt", function(err, buf) {
	var sommaire = fs.readFileSync (__dirname + "/sommaire.txt").toString ();
	var parser = new Parser (buf.toString(), sommaire);
	var tableContent = "";
	parser.getWords ().forEach (el => {
		tableContent += "<tr><td>"+ el.word + "</td><td>" + el.count + "</td></tr>";
	});
	var hContent = parser.getHtmlContent ();

	fs.writeFileSync ("./dist/index.html",
`<!doctype html>
<html>
  <head>
    <title>Mots</title>
    <meta charset="utf-8">
    <script type="module" src="bundle.js"></script>
		<style>
			#container {
				display : none;
			}
		</style>
  </head>
  <body>
  <div id="container">
    <div id="sidebar">
      <input id="search" type="text"/>
      <span id="previous">&lt;</span>
      <span id="next">&gt;</span>
      <table id="words">
        ${tableContent}
      </table>
    </div>
    <div id="main">
      <div id="header"></div>
      <div id="texte">
        <div class="content">
          ${hContent}
        </div>
      </div>
    </div>
    <div id="rightbar">
    </div>
  </div>
  </body>
</html>`);
	console.log ("index.html a été crée.");
});

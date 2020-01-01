module.exports = Parser;

function Parser (data, sommaireContent) {
	this.data = data;
	this.errors = [];
	this.sommaire = [];
	var level = 1;
	sommaireContent.split ("\n").forEach (el => {
		if (el.length) {
			if (el.search (/^(\d{1,1}|Introduction)/ig) != 0) {
				var m = el.match (/\s*(Chapitre\s*\d{1,1}\s*:)\s(.*)/);
				this.sommaire.push ({name:m[2], level :3});
				//this.sommaire.push ({name:m[2], level :3});
			}
			else
				this.sommaire.push ({name:el, level : 2});
		}
	});
}

Parser.prototype.getWords = function  () {
	var corpus = this.data
		//.replace (/-?\r?\n^/gm," ")
		.replace (/[\xAD]/g, "")
		.replace (/[\.,…”“«»\-\(\)\*"]/g, " ")
		.replace (/[A-Za-z\u00C0-\u00FF]{1,1}(['’])/g, " ")
		//.replace (/\s+/g, " ");

	var includes = ["est", "es", "foi", "loi", "ego", "égo", "âme"];
	var excludes = ["elle", "mais", "dans", "pour", "vous", "cela", "nous", "peut", "donc", "fait"]
	var result = {};
	corpus.split(/\s+/g).forEach (word => {
		word = word.toLowerCase ();
		if (word.length < 2 || excludes.indexOf (word) != -1) {
			return;
		}
		if (word.match (/[^A-Za-z\u00C0-\u00FFœ]/g)) {
			this.errors.push (word);
		}
		else {
			if (word.length > 3 || includes.indexOf (word) != -1) {
				if (!result [word]) {
					result[word]=1;
				}
				else
					result[word]++;
			}
			//else if (word.length == 3 && output.indexOf (word) == -1)
			 //output.push (word);
		}
	});
	//console.log (output.join (" "));
	var count = 0;
	var words = [];
	for (var name in result) {
		words.push ({ word : name, count : result[name]});
		count ++;
	}
	words.sort ((a,b)=> b.count - a.count);
	return words;
}

Parser.prototype.getHtmlContent = function () {
	var compare = (targetText) => {
		var index;
		var char = [], code = [];
		for (index = 0; index < targetText.length; ++index) {
				char.push (targetText.charAt (index));
				code.push (targetText.charCodeAt(index));
		}
		console.log(char.join (' '));
		console.log (code.join (' '));
	};
	//this.data = this.data.substring (0,1000)+this.data.substring (10000,12000);
	var content = ("<p>"+this.data+"</p>")
		.replace (/\n/g, "<br/>\n")
		.replace (/[\s+]/g, " ")
		.replace (/<br\/>/g, "<br/>\n");
		//console.log (chapters);
	var pos = content.search (/Chapitre 2:/);
	//compare (content.substring (pos,pos+12));
	for (var title of this.sommaire) {
		if (content.match (title.name).length > 1) {
			compare (title.name);
			break;
		}
		content = content.replace (title.name, "</p>\n<h"+title.level+">"+title.name+"</h"+title.level+">\n<p>");
		//break;
	}
	return content
		.replace (/…/g, '<p class="pause">…</p>')
		.replace (/<p>\s<\/p>/g, "");
}

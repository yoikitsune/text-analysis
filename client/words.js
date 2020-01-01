import { Subject } from "rxjs";

/**
 * Gestion de la table
 */
export class Words extends Subject {
	constructor (element) {
    super ();
		this.table = element;
		this.tableContent = this.table.innerHTML;
		this.words = [];

		var matches = this.tableContent.substring(7, this.tableContent.length-8).split (/<\/tr>/g);
		var reg = /^<tr><td>([^<]*).*$/g;
		matches.forEach ((match) => {
			var name = match.substring (8,match.indexOf ("</td>"));
			if (name.length)
				this.words.push ({ name : name, html : match + "</tr>"});
		});

		this.table.addEventListener ("click", (e) => {
			if (e.target.tagName == "TD" && e.target.previousElementSibling == null) {
        this.next (e.target.textContent);
			}
		});
	}

	updateTable (str) {
		let html = "<tbody>";
		for (const word of this.words) {
			if (word.name.indexOf (str) == 0)
				html += word.html;
		}
		html += "</tbody>";
		this.table.innerHTML = html;
	}
}

import './style.css';

import { TextBox, Headers } from './includes.js';
import { ScrollerBar } from './scrollerbar.js';
import { Input } from './input.js';
import { Words } from './words.js';

import { merge } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";

window.addEventListener("load", function() {
	const textBox = new TextBox (document.getElementById ("texte"));

	const header = document.getElementById ("header");
	const headers = new Headers (textBox.content);
	textBox.scroll$.pipe (
		map (top => headers.get (top)),
		distinctUntilChanged ()
	).subscribe (content => {
		header.textContent = content;
	});

	const input = new Input (document.getElementById ("search"));
	const words = new Words (document.getElementById ("words"));
	merge (
		input.pipe (tap (value => words.updateTable (value))),
		words.pipe (tap (value => input.set (value)))
	).subscribe (value => {
		textBox.update (value);
	});

  const scrollbar = new ScrollerBar (document.getElementById ("rightbar"));
	scrollbar.syncScroll (document.getElementById ("texte"));

	document.getElementById ("previous").addEventListener ("click", () => textBox.previousMark());
	document.getElementById ("next").addEventListener ("click", () => textBox.nextMark());
});

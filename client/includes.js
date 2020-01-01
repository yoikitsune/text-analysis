import { fromEvent } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
 *  Gestion du contenu principal
 */
export class TextBox {
	constructor (element) {
		this.container = element;
		this.content = element.querySelector ('.content');
		this.data = this.content.innerHTML;
		this.isReset = true;
		this.currentMark = 0;
		this.scroll$ = fromEvent (this.container, "scroll").pipe (
			startWith (this.container.scrollTop),
			map (() => this.container.scrollTop)
		);
	}

	update (source) {
		if (source.length > 2) {
			this.isReset = false;
			var html = this.data.replace (RegExp (source, "g"), "<mark>"+source+"</mark>");
			this.content.innerHTML = html;
			this.currentMark = 0;
			this.scrollToMark (this.currentMark);
		}
		else if (!this.isReset) {
			this.isReset = true;
			this.content.innerHTML = this.data;
		}
	}

	scrollToMark (index) {
		var el = this.content.querySelectorAll ("mark");
		if (el.length) {
			el = el[index];
			var current = this.content.querySelector ("mark.current")
			current && current.classList.remove ("current");
			el.classList.add ("current");
			this.container.scrollTo (0, el.offsetTop - 50);
			return true;
		}
	}

	nextMark () {
		this.scrollToMark (this.currentMark+1) && this.currentMark++;
	}

	previousMark () {
		this.currentMark > 0 && this.scrollToMark (--this.currentMark);
	}
}

/**
 * Gestion du header (fil d'ariane)
 */
export class Headers {
	constructor (element) {
		this.content = element;
		this.currentIndex = 0;
		this.currentPageOffset = 0;
		this.offsets = [];
		this.content.querySelectorAll ("h1,h2,h3").forEach (el => {
			this.offsets.push ([el.offsetTop, el.textContent]);
		});
		this.offsets.sort (function (a, b) { a[0] - b [0] });
	}

	get (scrollTop) {
		var goDown = scrollTop - this.currentPageOffset > 0;
		this.currentPageOffset = scrollTop;
		if (goDown) {
			if (!(scrollTop < this.offsets[this.currentIndex][0] || this.currentIndex+1 == this.offsets.length))
				this.currentIndex = this.offsets.findIndex ((el, i) => {
					return i+1==this.offsets.length || scrollTop < this.offsets[i+1][0];
				})
		}
		else if (scrollTop <= this.offsets[this.currentIndex][0]) {
				this.currentIndex = this.offsets.findIndex ((el, i) => {
					return scrollTop < this.offsets[i+1][0];
				})
		}
		return this.offsets[this.currentIndex][1];
	}
}

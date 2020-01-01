import { fromEvent, merge, Observable } from "rxjs";
import { mergeMap, map, takeUntil, startWith, tap } from "rxjs/operators";

const fromMutation = (target, config) => {
  return new Observable ((observer) => {
    const mutation = new MutationObserver((mutations, instance) => {
      observer.next(mutations);
    });
    mutation.observe(target, config);
    return () => {
      mutation.disconnect();
    };
  });
};

/**
 *  Gestion du scroller
 */
export class ScrollerBar {
	container;
	transformNode;
	contentNode;
	ratio = 0.1;
	scope;

	constructor (container, ratio=0.1) {
		this.container = container;
		this.ratio = ratio;

		this.scrollNode = document.createElement ("div");
		this.scrollNode.setAttribute ("class", "wrap");
		this.container.appendChild (this.scrollNode);

		this.scope = new Scope (this);

		this.transformNode = document.createElement ("div");
		this.transformNode.setAttribute ("class", "transform");
		this.scrollNode.appendChild (this.transformNode);

		this.contentNode = document.createElement ("div");
		this.contentNode.classList.add ("content");
		this.transformNode.appendChild (this.contentNode);
	}

	syncScroll (textContainer) {
		var textContent = textContainer.querySelector ('.content');
		this.transformNode.style.height = (textContent.offsetHeight * this.ratio)+"px";

    // Update content on any mutation and in the beginning
		fromMutation (textContent, { attributes: true, childList: true , subtree : true })
      .pipe (startWith (""))
		  .subscribe (()=>this.updateContent(textContent));

    // Init variables and update on resize
    let contentHeight, transformHeight, scrollHeight;
    let resize$ = new Observable (observer => {
			fromEvent (window, "resize")
        .pipe (startWith (""))
    		.subscribe (e => {
    			this.scope.height (textContainer.offsetHeight * this.ratio);
          contentHeight = textContent.offsetHeight-textContainer.offsetHeight;
          transformHeight = this.transformNode.offsetHeight-this.scrollNode.offsetHeight;
          scrollHeight = this.scrollNode.offsetHeight-(textContainer.offsetHeight * this.ratio);
          observer.next (textContainer.scrollTop);
    		});
    });

    // Update scroll on source scroll change
		merge (
      resize$,
			fromEvent (textContainer, 'scroll').pipe (map (e => e.target.scrollTop))
		).pipe (
			map (top => top/contentHeight)
		).subscribe (ratio => {
			this.scrollNode.scrollTo (0, transformHeight * ratio)
			this.scope.top (scrollHeight * ratio);
		});

    // Update source scroll on click or drag scrope or mousewheel
		merge (
			this.scope.onDrag$
				.pipe (map (top => {
          return {
            top : contentHeight * (top / scrollHeight)
          };
        })),
			fromEvent (this.transformNode, "click")
				.pipe (map (e => {
          return {
            top : contentHeight * ((e.clientY+this.scrollNode.scrollTop-this.scope.height()/2)
                      / (this.transformNode.offsetHeight - this.scope.height())),
            behavior : "smooth"
          };
        })),
      fromEvent (this.scrollNode, "wheel")
        .pipe (map (e => {
          e.preventDefault();
          return {
            top : textContainer.scrollTop + e.deltaY*48,
            behavior : "smooth"
          }
        }))
		).subscribe (e => textContainer.scrollTo (e));
	}

	updateContent (textContent) {
		//var r = "(^[^>]*|>.*)"+$("#search")[0].value+"[^<]*";
		var html = textContent.innerHTML;
		/*for (var p of html.match (RegExp (r, "gm"))) {
			if (p.indexOf (">") == 0)
				prefix = ">";
			else
				prefix = "";
			html = html.replace (p, prefix+"<mark>"+p+"</mark>");
		}*/
		this.contentNode.innerHTML = html;
	}
}

class Scope {
	scrollerBar;
	element;
	onDrag$;
	constructor (scrollerBar) {
		this.scrollerBar = scrollerBar;

		this.element = document.createElement ("div");
		this.element.setAttribute ("id", "scope");
		this.scrollerBar.scrollNode.appendChild (this.element);

	  var
	  	mousedown = fromEvent(this.element, 'mousedown'),
	    mousemove = fromEvent(this.scrollerBar.container, 'mousemove'),
			mouseup   = fromEvent(this.scrollerBar.container, 'mouseup');

	  this.onDrag$ = mousedown.pipe (
			mergeMap (md => {
		    var startY = md.offsetY;
		    return mousemove.pipe (
					map (mm => {
			      mm.preventDefault();
			      return mm.clientY - startY;
		    	}),
					takeUntil(mouseup)
				);
		  })
		);
	}

	top (val = false) {
		if (val === false) return this.element.offsetTop;
		this.element.style.top = val + "px";
	}

	height () {
		if (!arguments.length) return this.element.offsetHeight;
		this.element.style.height = arguments[0] + "px";
	}
}

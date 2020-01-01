import { BehaviorSubject, fromEvent } from "rxjs";
import { distinctUntilChanged, map, debounceTime } from "rxjs/operators";

export class Input extends BehaviorSubject {
  constructor (element) {
    super (element.value);
    this.element = element;
    fromEvent (this.element, "input").pipe (
      map (e => e.target.value),
      debounceTime(400),
      distinctUntilChanged ()
    ).subscribe (value => this.next (value));
  }

  set (value) {
    this.element.value = value;
  }
}

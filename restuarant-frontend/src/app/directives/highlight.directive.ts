import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight = false;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges() {
    if (this.appHighlight) {
      this.renderer.setStyle(this.el.nativeElement, 'background-color', '#fff9c4'); // Light yellow
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    }
  }
}

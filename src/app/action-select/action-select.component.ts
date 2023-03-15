import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-action-select',
  templateUrl: './action-select.component.html',
  styleUrls: ['./action-select.component.css']
})
export class ActionSelectComponent implements OnChanges {
  public selectedValue: string = 'delete';
  @Input() options: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && changes['options'].currentValue) {
      // Update the component state with the new options
      this.options = changes['options'].currentValue;
    }

    if (!this.options.includes('Other')) {
      this.options.unshift('Other');
    }

    if (!this.options.includes('Ignore')) {
      this.options.push('Ignore');
    }

    if (!this.options.includes(this.selectedValue)) {
      this.selectedValue = this.options[0];
    }
  }

  onSelectChange(newValue: string) {
    // TODO
  }
}

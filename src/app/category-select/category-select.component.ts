import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.css']
})
export class CategorySelectComponent implements OnChanges {
  public selectedValue: string = 'delete';
  @Input() options: string[] = [];

  @Input() set isHeaderRow(value: boolean) {
    if (value) {
      this.selectedValue = 'Ignore';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && changes['options'].currentValue !== changes['options'].previousValue) {
      let options = changes['options'].currentValue;;

      if (!options.includes('Other')) {
        options.unshift('Other');
      }

      if (!options.includes('Ignore')) {
        options.push('Ignore');
      }

      // Update the component state with the new options
      this.options = options;

      if (!options.includes(this.selectedValue)) {
        this.selectedValue = options[0];
      }
    }
  }

  onSelectChange(newValue: string) {
    // TODO
  }
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-select',
  templateUrl: './header-select.component.html',
  styleUrls: ['./header-select.component.css']
})
export class HeaderSelectComponent {
  public selectedValue: string = 'Keep';

  @Input() set isAmount(value: boolean) {
    this.selectedValue = value ? 'Amount' : 'Keep';
  }

  onSelectChange(newValue: string) {
    // TODO
  }
}

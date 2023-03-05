import { Component } from '@angular/core';

@Component({
  selector: 'app-header-select',
  templateUrl: './header-select.component.html',
  styleUrls: ['./header-select.component.css']
})
export class HeaderSelectComponent {
  public selectedValue: string = 'keep';

  onSelectChange(newValue: string) {
    // TODO
  }
}

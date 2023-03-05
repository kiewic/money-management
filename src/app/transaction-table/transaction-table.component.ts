import { Component } from '@angular/core';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.css']
})
export class TransactionTableComponent {
  public categoryOptions: string[] = [];
  columnCount = 0;
  items: string[][] = [];

  public parseFile(fileContent: string) {
    let maxColumnCount = 0;
    const rows = fileContent.split('\n');
    this.items = []
    for (const row of rows) {
      const columns = row.split(',');
      maxColumnCount = Math.max(columns.length, maxColumnCount);
      this.items.push(columns);
    }
    this.columnCount = maxColumnCount;
  }

  public getOutput(): string {
    return 'Hello!';
  }
}

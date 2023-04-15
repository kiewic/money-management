import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActionSelectComponent } from '../action-select/action-select.component';
import { HeaderSelectComponent } from '../header-select/header-select.component';
import Decimal from '../../assets/decimal';

interface OutputRow {
  actionSelection: string;
  values: string[];
};

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.css']
})
export class TransactionTableComponent {
  public categoryOptions: string[] = [];
  columnCount = 0;
  amountColumnIndex = -1;
  items: string[][] = [];
  calculations: { total: Decimal; categories: { [key: string]: Decimal; }; };

  @ViewChildren(HeaderSelectComponent) headerSelects!: QueryList<HeaderSelectComponent>;
  @ViewChildren(ActionSelectComponent) actionSelects!: QueryList<ActionSelectComponent>;
  @ViewChildren('myInput') inputs!: QueryList<ElementRef>;

  constructor() {
    this.calculations = this.initializeCalculations();
  }

  public parseFile(fileContent: string) {
    let maxColumnCount = 0;
    const rows = fileContent.split('\n');
    this.items = [];
    for (const row of rows) {
      if (row.trim().length === 0) {
        continue;
      }
      const columns = row.split(',');
      for (let i = 0; i < columns.length; i++) {
        columns[i] = this.removeQuotes(columns[i]);
      }
      maxColumnCount = Math.max(columns.length, maxColumnCount);
      this.items.push(columns);
    }
    this.columnCount = maxColumnCount;
    this.autoCalculateHeaders();
  }

  /** This code assumer there is a header row that contains the value `Amount` */
  private autoCalculateHeaders() {
    this.amountColumnIndex = -1;
    if (this.items.length >= 1) {
      this.amountColumnIndex = this.items[0].findIndex(x => x === 'Amount');
    }
  }

  private removeQuotes(str: string): string {
    if (str.length > 1 && str[0] === '"' && str[str.length - 1] === '"') {
      return str.slice(1, -1);
    }
    return str;
  }

  public getOutput(): string {
    this.calculations = this.initializeCalculations();
    const rows = this.processTransactions();
    this.sortByCategory(rows);

    const output: string[] = [];
    output.push(...this.stringifyCategoryAmounts());
    output.push(...this.stringifyTransactions(rows));
    return output.join('\n');
  }

  private processTransactions(): OutputRow[] {
    const actionSelections: string[] = this.actionSelects.map(x => x.selectedValue);
    const columnSelections: string[] = this.headerSelects.map(x => x.selectedValue);
    const columnCount = this.columnCount;
    const inputs = this.inputs.toArray();
    const rows: OutputRow[] = [];
    for (let i = 0; i < actionSelections.length; i++) {
      const actionSelection = actionSelections[i];
      const row = this.processSingleTransaction(
        actionSelection,
        columnSelections,
        inputs.slice(i * columnCount, i * columnCount + columnCount),
      );
      if (row !== undefined) {
        rows.push({
          actionSelection,
          values: row,
        });
      }
    }
    return rows;
  }

  private sortByCategory(rows: OutputRow[]) {
    rows.sort((a, b) => {
      if (a.actionSelection > b.actionSelection) return 1;
      if (a.actionSelection < b.actionSelection) return -1;
      return 0;
    });
  }

  private processSingleTransaction(
    actionSelection: string,
    columnSelections: string[],
    inputs: ElementRef[],
  ): string[] | undefined {
    if (actionSelection !== 'Ignore') {
      const row: string[] = [];
      for (let i = 0; i < columnSelections.length; i++) {
        const columnSelection = columnSelections[i];
        if (columnSelection === 'Ignore') {
          continue;
        }

        const columnValue = inputs[i].nativeElement.value;
        if (columnSelection === 'Amount') {
          this.addAmount(columnValue, actionSelection);
        }
        row.push(columnValue);
      }
      return row;
    }
    return;
  }

  private initializeCalculations() {
    return {
      total: new Decimal(0),
      categories: {},
    };
  }

  private addAmount(columnValue: string, actionSelection: string) {
    const calculations = this.calculations;

    const amount = new Decimal(columnValue);
    calculations.total = calculations.total.plus(amount);

    const categories = calculations.categories;
    if (categories[actionSelection] === undefined) {
      categories[actionSelection] = new Decimal(0);
    }
    categories[actionSelection] = categories[actionSelection].plus(amount);
  }

  private stringifyTransactions(rows: OutputRow[]): string[] {
    const outputColumnCount: number = this.headerSelects.filter(x => x.selectedValue !== 'Ignore').length;
    const output: string[] = [];
    let currentActionSelection;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (currentActionSelection != row.actionSelection) {
        // Print current actionSelection
        if (currentActionSelection !== undefined) {
          output.push(this.stringifySingleAmount(currentActionSelection, outputColumnCount));
        }

        currentActionSelection = row.actionSelection;
      }
      output.push(row.values.join(','));
    }

    // Print last current actionSelection
    if (currentActionSelection !== undefined) {
      output.push(this.stringifySingleAmount(currentActionSelection, outputColumnCount));
    }

    return output;
  }

  private stringifyCategoryAmounts(): string[] {
    const calculations = this.calculations;
    const rows: string[] = [];
    rows.push(`total,${calculations.total.toString()}`);
    for (const category in calculations.categories) {
      rows.push(this.stringifySingleAmount(category, 2));
    }
    return rows;
  }

  private stringifySingleAmount(actionSelection: string, outputColumnCount: number): string {
    const output: string[] = new Array(Math.max(0, outputColumnCount - 2));
    const calculations = this.calculations;
    output.push(actionSelection);
    output.push(calculations.categories[actionSelection].toString());
    return output.join(',');
  }
}

import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { HeaderSelectComponent } from '../header-select/header-select.component';
import Decimal from '../../assets/decimal';

interface OutputRow {
  categorySelection: string;
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
  @ViewChildren(CategorySelectComponent) categorySelects!: QueryList<CategorySelectComponent>;
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
    const categorySelections: string[] = this.categorySelects.map(x => x.selectedValue);
    const columnSelections: string[] = this.headerSelects.map(x => x.selectedValue);
    const columnCount = this.columnCount;
    const inputs = this.inputs.toArray();
    const rows: OutputRow[] = [];
    for (let i = 0; i < categorySelections.length; i++) {
      const categorySelection = categorySelections[i];
      const row = this.processSingleTransaction(
        categorySelection,
        columnSelections,
        inputs.slice(i * columnCount, i * columnCount + columnCount),
      );
      if (row !== undefined) {
        rows.push({
          categorySelection,
          values: row,
        });
      }
    }
    return rows;
  }

  private sortByCategory(rows: OutputRow[]) {
    rows.sort((a, b) => {
      if (a.categorySelection > b.categorySelection) return 1;
      if (a.categorySelection < b.categorySelection) return -1;
      return 0;
    });
  }

  private processSingleTransaction(
    categorySelection: string,
    columnSelections: string[],
    inputs: ElementRef[],
  ): string[] | undefined {
    if (categorySelection !== 'Ignore') {
      const row: string[] = [];
      for (let i = 0; i < columnSelections.length; i++) {
        const columnSelection = columnSelections[i];
        if (columnSelection === 'Ignore') {
          continue;
        }

        const columnValue = inputs[i].nativeElement.value;
        if (columnSelection === 'Amount') {
          this.addAmount(columnValue, categorySelection);
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

  private addAmount(columnValue: string, categorySelection: string) {
    const calculations = this.calculations;

    const amount = new Decimal(columnValue);
    calculations.total = calculations.total.plus(amount);

    const categories = calculations.categories;
    if (categories[categorySelection] === undefined) {
      categories[categorySelection] = new Decimal(0);
    }
    categories[categorySelection] = categories[categorySelection].plus(amount);
  }

  private stringifyTransactions(rows: OutputRow[]): string[] {
    const outputColumnCount: number = this.headerSelects.filter(x => x.selectedValue !== 'Ignore').length;
    const output: string[] = [];
    let currentCategorySelection;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (currentCategorySelection != row.categorySelection) {
        // Print current categorySelection
        if (currentCategorySelection !== undefined) {
          output.push(this.stringifySingleAmount(currentCategorySelection, outputColumnCount));
        }

        currentCategorySelection = row.categorySelection;
      }
      output.push(row.values.join(','));
    }

    // Print last current categorySelection
    if (currentCategorySelection !== undefined) {
      output.push(this.stringifySingleAmount(currentCategorySelection, outputColumnCount));
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

  private stringifySingleAmount(categorySelection: string, outputColumnCount: number): string {
    const output: string[] = new Array(Math.max(0, outputColumnCount - 2));
    const calculations = this.calculations;
    output.push(categorySelection);
    output.push(calculations.categories[categorySelection].toString());
    return output.join(',');
  }
}

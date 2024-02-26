import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { HeaderSelectComponent } from '../header-select/header-select.component';
import Decimal from '../../assets/decimal';

interface OutputRow {
  amount: Decimal;
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

    const output: string[] = [];
    output.push(...this.stringifyCategoryAmounts());
    output.push('');
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
        rows.push(row);
      }
    }
    return rows;
  }

  private sortByAmount(rows: OutputRow[]) {
    rows.sort((a, b) => {
      return a.amount.comparedTo(b.amount);
    });
  }

  private processSingleTransaction(
    categorySelection: string,
    columnSelections: string[],
    inputs: ElementRef[],
  ): OutputRow | undefined {
    if (categorySelection !== 'Ignore') {
      const values: string[] = [];
      let amount: Decimal = new Decimal(0);
      for (let i = 0; i < columnSelections.length; i++) {
        const columnSelection = columnSelections[i];
        if (columnSelection === 'Ignore') {
          continue;
        }

        const columnValue = inputs[i].nativeElement.value;
        if (columnSelection === 'Amount') {
          this.addAmount(columnValue, categorySelection);
          amount = new Decimal(columnValue);
        }
        values.push(columnValue);
      }
      return {
        amount,
        categorySelection,
        values,
      };
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

    const uniqueCategories = rows.map(x => x.categorySelection).filter((value, index, self) => self.indexOf(value) === index);
    for (const currentCategorySelection of uniqueCategories) {
      const categoryRows = rows.filter(x => x.categorySelection === currentCategorySelection);
      this.sortByAmount(categoryRows);
      for (const row of categoryRows) {
          output.push(row.values.join('\t'));
      }
      // Print current categorySelection
      output.push(this.stringifySingleAmount(currentCategorySelection, outputColumnCount));
    }

    return output;
  }

  private stringifyCategoryAmounts(): string[] {
    const rows: string[] = [];
    rows.push(`total\t${this.calculations.total.toString()}`);
    for (const tuple of this.sortCategoriesByAmount()) {
      const [category] = tuple;
      rows.push(this.stringifySingleAmount(category, 2));
    }
    return rows;
  }

  private sortCategoriesByAmount(): [string, Decimal][] {
    const categories = this.calculations.categories;
    const tuples: [string, Decimal][] = Object.keys(categories).map<[string, Decimal]>(x => [x, categories[x]]);
    tuples.sort((a, b) => a[1].sub(b[1]).toNumber());
    return tuples;
  }

  /** Empty string, empty string, ..., category selection, category total */
  private stringifySingleAmount(categorySelection: string, outputColumnCount: number): string {
    const output: string[] = new Array(Math.max(0, outputColumnCount - 2));
    const calculations = this.calculations;
    output.push(categorySelection);
    output.push(calculations.categories[categorySelection].toString());
    return output.join('\t');
  }
}

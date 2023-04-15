import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FileUploadService } from './file-upload.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';

const dummyInput = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
12/04/2021,12/05/2021,AMZN Mktp US*CH55AQ4M3,Shopping,Sale,-12.01,
11/31/2021,12/02/2021,AMZN Mktp US*X97DW3WS3,Shopping,Sale,-31.26,
11/18/2021,11/18/2021,REDEMPTION CREDIT,Fees & Adjustments,Adjustment,39.84,
11/18/2021,11/18/2021,Payment Thank You - Web,,Payment,2288.56,
11/16/2021,11/17/2021,FB*32 DegWeather,Shopping,Sale,-27.43,`;

enum ColumnType {
  Ignore = "Ignore",
  PostDate = "Post Date",
  Description = "Description",
  Amount = "Amount",
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  textAreaControl = new FormControl('');

  @ViewChild(TransactionTableComponent)
  private transactionTable?: TransactionTableComponent;

  @ViewChild('outputText')
  private outputTextRef?: ElementRef;

  constructor(_fileUploadService: FileUploadService) {
    // subscribe to the valueChanges observable of textAreaControl
    this.textAreaControl.valueChanges.pipe(
      // use debounceTime operator to delay emitting values by 1 second
      debounceTime(1000),
      // use map operator to split value by newline characters and filter out any empty strings
      map(value => (value || '').split('\n').filter(line => line.trim() !== '')),
      // use distinctUntilChanged operator to ignore duplicate values
      distinctUntilChanged()
    ).subscribe(value => {
      // assign result to a variable named options
      this.transactionTable!.categoryOptions = value;
    });
  }

  ngOnInit(): void {
    const categories: string[] = [
      'Bills and services',
      'Car (gas and parking)',
      'Groceries',
      'Restaurants',
      'Tennis',
      'Travel',
      'Other',
    ];
    this.textAreaControl.setValue(categories.join('\n'));
  }

  ngAfterViewInit() {
    // Tick to avoid a ExpressionChangedAfterItHasBeenCheckedError
    // since the current change detection cycle is complete
    setTimeout(() => this.parseFile(dummyInput));
  }

  public handleClick() {
    this.outputTextRef!.nativeElement.value = ''; // Clear first, in case getOutput() fails
    this.outputTextRef!.nativeElement.value = this.transactionTable!.getOutput();
  }

  handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (!files) {
      return;
    }
    const fileToUpload = files.item(0);;
    fileToUpload?.text().then(
      (text: string) => this.parseFile(text),
      (error: any) => console.error(error)
    );
  }

  parseFile(text: string) {
    if (this.transactionTable === undefined) {
      throw new TypeError('transactionTable');
    }

    this.transactionTable.parseFile(text);
  }
}

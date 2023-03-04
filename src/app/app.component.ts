import { Component } from '@angular/core';
import { FileUploadService } from './file-upload.service';

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
export class AppComponent {
  items: string[][] = [];
  categories: string[] = [
    'bills and services',
    'car (gas and parking)',
    'deleted',
    'groceries',
    'other',
    'restaurants',
    'tennis',
    'travel',
  ];
  columnCount = 0;

  constructor(fileUploadService: FileUploadService) {
    this.parseFile(dummyInput);
  }

  handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (!files) {
      return;
    }
    const fileToUpload = files.item(0);;
    fileToUpload?.text().then(
      (text: string) => console.log(text),
      (error: any) => console.error(error)
    );
  }

  private parseFile(fileContent: string) {
    const rows = fileContent.split('\n');
    for (const row of rows) {
      const columns = row.split(',');
      this.columnCount = Math.max(columns.length, this.columnCount);
      this.items.push(columns);
    }
  }
}

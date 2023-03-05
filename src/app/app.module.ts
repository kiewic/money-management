import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Needed for formControl HTML attribute

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderSelectComponent } from './header-select/header-select.component';
import { ActionSelectComponent } from './action-select/action-select.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionTableComponent,
    ActionSelectComponent,
    HeaderSelectComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Needed for formControl HTML attribute

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderSelectComponent } from './header-select/header-select.component';
import { ActionSelectComponent } from './action-select/action-select.component';

@NgModule({
  declarations: [
    AppComponent,
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

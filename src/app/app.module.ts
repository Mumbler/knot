/*!
 * Copyright MagnusIT GmbH 2018 - All rights reserved
 */

// Angular basic
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { MumbleDirective } from './mumble.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule( {
    declarations: [
        AppComponent,
        MumbleDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        HammerModule
    ],
    providers: [],
    bootstrap: [ AppComponent ],
    entryComponents: []
} )

export class AppModule {
}

/*!
 * Copyright MagnusIT GmbH 2018 - All rights reserved
 */

import { Component } from '@angular/core';


@Component( {
  selector: 'mit-root',
  template: `
            <div class="mumble" mitMumble [mumbleWidth]="mumbleWidth" [knots]="knots" [width]="width" [height]="height"></div>
            <div class="controls">
                <mat-form-field class="form-field">
                    <input matInput type="number" placeholder="Mumble Width" [(ngModel)]="mumbleWidth">
                </mat-form-field>
                <mat-form-field class="form-field">
                    <input matInput type="number" placeholder="#Knots" [(ngModel)]="knots">
                </mat-form-field>
                <mat-form-field class="form-field">
                    <input matInput type="number" placeholder="Surface width" [(ngModel)]="width">
                </mat-form-field>
                <mat-form-field class="form-field">
                    <input matInput type="number" placeholder="Suface height" [(ngModel)]="height">
                </mat-form-field>
            </div>
  `,
    styles: [
        'div.mumble {width: 100vw; height: 75vh}',
        'div.controls { width: 750px; min-width: 500px; margin-left: auto; margin-right: auto; }'
    ]
} )

export class AppComponent {

    private _mumbleWidth : number = 300;
    private _knots : number = 25;

    private _width : number = 1000;
    private _height : number = 150;


    public get mumbleWidth (): number {

        return this._mumbleWidth;

    }

    public set mumbleWidth ( value: number ) {

        this._mumbleWidth = value;

    }

    public get knots (): number {

        return this._knots;

    }

    public set knots ( value: number ) {

        this._knots = value;

    }

    public get width (): number {

        return this._width;

    }

    public set width ( value: number ) {

        this._width = value;

    }

    public get height (): number {

        return this._height;

    }

    public set height ( value: number ) {

        this._height = value;

    }

}

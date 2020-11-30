import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';


@Component({
  selector: 'app-recent-expenses',
  templateUrl: './recent-expenses.component.html',
  styleUrls: ['./recent-expenses.component.scss']
})
export class RecentExpensesComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDialog() {
    this.dialog.open(AddExpenseDialog);
  }
  
}
@Component({
  selector: 'dialog-add-expense-dialog',
  templateUrl: 'dialog-add-expense-dialog.html',
  styleUrls: ['./dialog-add-expense-dialog.scss']
})
export class AddExpenseDialog {
  constructor(private _ngZone: NgZone){

  }
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}

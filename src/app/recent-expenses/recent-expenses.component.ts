import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

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

}

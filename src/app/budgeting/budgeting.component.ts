import { Component,  OnInit, NgZone,ViewChild } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Budget } from '../shared/models/budget.model';



@Component({
  selector: 'app-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.scss']
})
export class BudgetingComponent implements OnInit {

  conversion = {
    "weekly": "Weekly",
    "biWeekly": "Bi-Weekly",
    "monthly": "Monthly",
    "annually": "Anually"
  }

  constructor(public dialog: MatDialog, public afs: FirestoreService,public auth: AuthService) { }

  ngOnInit(): void {
    this.afs.budgets.forEach(b => {
      this.afs.budgetSpending = [];
      this.afs.budgetSpending.push(0);
    });
    this.afs.getBudgetSpending();
    console.log("init");
  }

  addCard(){
    this.dialog.open(AddBudgetDialog);
  } 
}
@Component({
    selector: 'dialog-add-Card-Dialog',
    templateUrl: 'dialog-add-Card-Dialog.html',
    styleUrls: ['./dialog-add-Card-Dialog.scss']
})
export class AddBudgetDialog {

    newBudgetForm = new FormGroup({
        budgetName: new FormControl(''),
        budgetAmount: new FormControl(''),
        category: new FormControl(''),
        schedule: new FormControl(''),
        budgetDesc: new FormControl('')
    
    });
    budgetName = new FormControl('');
    budgetAmount= new FormControl('');
    category= new FormControl('');
    schedule= new FormControl('');
    budgetDesc= new FormControl('');

  constructor(private _ngZone: NgZone, public afs: FirestoreService, public snackbar: MatSnackBar, public auth: AuthService, public dialogRef: MatDialogRef<AddBudgetDialog> ){

    }
    @ViewChild('autosize') autosize: CdkTextareaAutosize;

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this._ngZone.onStable.pipe(take(1))
            .subscribe(() => this.autosize.resizeToFitContent(true));
      }

    onSubmit(){
        console.warn(this.newBudgetForm.value);
      
      const form = this.newBudgetForm.value
        let newBudgets: string[] = [];
        let amount = parseFloat(form.budgetAmount);
        amount = Math.round((amount + Number.EPSILON) * 100) / 100;
        this.afs.createBudget(this.auth.userGroupID, form.budgetName, amount , form.category, form.schedule, form.budgetDesc).then(b => {
            this.snackbar.open("Budget submitted successfully.", "Ok", {
              duration: 3000
            })
            this.dialogRef.close();
          });
     

    }

      
}



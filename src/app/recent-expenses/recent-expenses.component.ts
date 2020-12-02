import { Component, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { FormGroup, FormControl, FormArray, Validators} from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Expense } from '../shared/models/expense.model';

@Component({
  selector: 'app-recent-expenses',
  templateUrl: './recent-expenses.component.html',
  styleUrls: ['./recent-expenses.component.scss']
})
export class RecentExpensesComponent implements OnInit {
  
  constructor(public dialog: MatDialog, public auth: AuthService, public afs: FirestoreService) { }

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
export class AddExpenseDialog implements OnInit{
  
  newExpenseForm: FormGroup;

  constructor(private _ngZone: NgZone, public afs: FirestoreService,public auth: AuthService, public dialogRef: MatDialogRef<AddExpenseDialog>, public snackbar: MatSnackBar){
    //this.isGain.setValue(false);
  }

  ngOnInit(): void {
    
    this.newExpenseForm= new FormGroup({
      amount: new FormControl('',[Validators.min(.01),Validators.required]),
      isGain: new FormControl(false),
      expenseType: new FormControl(''),
      expenseDesc: new FormControl('',Validators.required),
      checkboxes: new FormArray([])
    });
    let checkboxes = this.newExpenseForm.get("checkboxes") as FormArray
    for(let i = 0; i < this.auth.groupMembers.length; i++){
      const control = new FormControl(true);
      checkboxes.push(control);
    }
  }


  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  onSubmit() {
    //TODO 
    console.warn(this.newExpenseForm.value);
    const form = this.newExpenseForm.value 
    let chargedIDs: string[] = [];
    for(let i = 0; i < form.checkboxes.length; i++){
      if(form.checkboxes[i]){
        chargedIDs.push(this.auth.groupMembers[i].uid);
      }
    }
    let amount = parseFloat(form.amount);
    amount = Math.round((amount + Number.EPSILON) * 100) / 100;
    if(!form.isGain){
      this.afs.createExpense(this.auth.user, chargedIDs, amount, form.expenseType, form.expenseDesc, this.auth.userGroupID).then(_ =>{
        this.snackbar.open("Expense submitted successfully.", "Ok", {
          duration: 3000
        })
        this.dialogRef.close();
      });
    } else{
      this.afs.pay(this.auth.user.uid,chargedIDs, amount,form.expenseDesc).then(_ =>{
        this.snackbar.open("Payment successfully recorded.", "Ok", {
          duration: 3000
        });
        this.dialogRef.close();
      });
    }
  }


}

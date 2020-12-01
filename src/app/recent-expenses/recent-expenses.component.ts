import { Component, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { FormGroup, FormControl, FormArray} from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';

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
export class AddExpenseDialog implements OnInit{
  
  newExpenseForm: FormGroup;

  constructor(private _ngZone: NgZone, public afs: FirestoreService,public auth: AuthService){
    //this.isGain.setValue(false);
  }

  ngOnInit(): void {
    
    this.newExpenseForm= new FormGroup({
      amount: new FormControl(''),
      isGain: new FormControl(false),
      expenseType: new FormControl(''),
      expenseDesc: new FormControl(''),
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
    let amount = -1 * parseFloat(form.amount)
    if(form.isGain){
      amount *= -1;
    }
    amount = Math.round((amount + Number.EPSILON) * 100) / 100;
    this.afs.createExpense(this.auth.user.uid, chargedIDs, amount, form.expenseType, form.expenseDesc);
  }


}

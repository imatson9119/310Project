import { Component,  OnInit, NgZone,ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.scss']
})
export class BudgetingComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {

  }

  addCard(){
    this.dialog.open(AddBudgetDialog);
  }

  clearCards(){
    ;
    
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
        budgetSchedule: new FormControl(''),
        budgetDesc: new FormControl('')
    
    });
    budgetName = new FormControl('');
    budgetAmount= new FormControl('');
    category= new FormControl('');
    budgetSchedule= new FormControl('');
    budgetDesc= new FormControl('');

    constructor(private _ngZone: NgZone, public afs: FirestoreService){

    }
    @ViewChild('autosize') autosize: CdkTextareaAutosize;

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this._ngZone.onStable.pipe(take(1))
            .subscribe(() => this.autosize.resizeToFitContent(true));
      }

    onSubmit(){
        console.warn(this.newBudgetForm.value);

    }
}



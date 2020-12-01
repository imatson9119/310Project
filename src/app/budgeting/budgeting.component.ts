import { Component,  OnInit, NgZone,ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';


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

  clearCards(){}

}

@Component({
    selector: 'dialog-add-Card-Dialog',
    templateUrl: 'dialog-add-Card-Dialog.html',
    styleUrls: ['./dialog-add-Card-Dialog.scss']
})
export class AddBudgetDialog {
    constructor(private _ngZone: NgZone){

    }
    @ViewChild('autosize') autosize: CdkTextareaAutosize;

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this._ngZone.onStable.pipe(take(1))
            .subscribe(() => this.autosize.resizeToFitContent(true));
      }


}

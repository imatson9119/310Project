import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(public auth: AuthService, public snackbar: MatSnackBar, public dialog: MatDialog) { }

  ngOnInit(): void {
  }
  signOut(){
    this.auth.signOut();
    this.snackbar.open("Successfully signed out.","Ok",{
      duration: 3000
    })
  }
  openDialog(){
    this.dialog.open(GroupInfoDialog);
  }
}
@Component({
  selector: 'dialog-group-info-dialog',
  templateUrl: 'dialog-group-info-dialog.html',
  styleUrls: ['./dialog-group-info-dialog.scss']
})
export class GroupInfoDialog {
  constructor(){

  }
}
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(public auth: AuthService, public snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }
  signOut(){
    this.auth.signOut();
    this.snackbar.open("Successfully signed out.","Ok",{
      duration: 3000
    })
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group } from '../group.model';
import firebase from "firebase/app";
import { group } from 'console';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(public auth: AuthService, public snackbar: MatSnackBar, public dialog: MatDialog,) { }

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
  constructor(public auth: AuthService, public firestore: AngularFirestore,public snackbar: MatSnackBar){

  }
  groupCode = new FormControl('');
  groupName = new FormControl('');
  codeError = '';

  joinGroup(){
    if(this.auth.user.uid == null){ //User is not logged in (cannot happen execept during development)
      this.groupCode.setErrors({'incorrect': true})
      this.codeError = 'Error: not logged in'
      return;
    }
    let code: string = this.groupCode.value; 
    let ref = this;
    if(code.length != 6){ //Code is not the proper length, produce an error
      this.groupCode.setErrors({'incorrect': true})
      this.codeError = 'Error: invalid code'
      
      return;
    } else{ // Code is a valid length, we need to query the database to see if it is a valid code
      this.firestore.collection<Group>("Groups").get().subscribe(data => {
        data.query.where("code","==",code).limit(1).get().then(function(querySnapshot) {
          let valid = false;
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              valid = true;
              console.log(doc.id, " => ", doc.data());
              ref.addUserToGroup(ref.auth.user.uid,doc.id,doc.data().name);
          });
          if(!valid){
            ref.groupCode.setErrors({'incorrect': true})
            ref.codeError = 'Error: invalid code'
          }
        })
        .catch(function(error) {
            console.log("Error getting groups: ", error);
        });
      })
     
    }
  }

  addUserToGroup(uid: string, groupID: string, groupName: string){
    this.firestore.doc(`users/${uid}`).update({
      group: groupID
      }).then(_ => {
        this.firestore.doc<Group>(`Groups/${groupID}`).update({
          users: firebase.firestore.FieldValue.arrayUnion(uid)
        }).then(_ => {
          this.auth.userGroup = groupID;
          this.snackbar.open('You have been successfully added to the group "'+ groupName +'"',"Ok",{
            duration: 3000
          })
        })
      })
  }
  createGroup(){
    
  }
}
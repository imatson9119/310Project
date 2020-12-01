import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group } from '../group.model';
import firebase from "firebase/app";
import { User } from 'src/app/services/user.model';


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
export class GroupInfoDialog implements OnInit{
  constructor(public auth: AuthService, public firestore: AngularFirestore,public snackbar: MatSnackBar,public dialogRef: MatDialogRef<GroupInfoDialog>){

  }
  groupCode = new FormControl('');
  groupName = new FormControl('');
  codeError = '';
  nameError = '';
  userGroup: Group = null;

  ngOnInit(): void {
    if(this.auth.userGroupID){ //Get user group
      this.userGroup = this.auth.userGroup;
    }
  }

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
          this.auth.userGroupID = groupID;
          this.updateAuthGroup(groupID);
          this.snackbar.open('You have been successfully added to the group "'+ groupName +'"',"Ok",{
            duration: 3000
          })
          this.dialogRef.close();
          
        })
      })
  }
  updateAuthGroup(groupID: string){
    this.firestore.doc<Group>(`Groups/${groupID}`).get().subscribe(docRef => {
      this.auth.userGroup = docRef.data();
    })
  }
  createGroup(){
    if(this.auth.user.uid == null){ //User is not logged in (cannot happen execept during development)
      this.groupName.setErrors({'incorrect': true})
      this.nameError = 'Error: not logged in'
      return
    }
    let name: string = this.groupName.value
    if(name.length < 1 || name.length > 20){
      this.groupName.setErrors({'incorrect': true})
      this.nameError = 'Error: group name must be less than 20 characters'
    } else if(!this.isAlphaNumeric(name)){
      this.groupName.setErrors({'incorrect': true})
      this.nameError = 'Error: group name must be alphanumeric'
    } else{
      let code = this.makeid(6);
      let newGroup: Group = {
        code: code,
        name: name,
        users: []
      };
      this.firestore.collection<Group>('Groups').add(newGroup).then(groupRef => {
        this.addUserToGroup(this.auth.user.uid,groupRef.id,newGroup.name);
      });
    }
  }

  leaveGroup(){
    if(this.userGroup.users.length == 1){
      this.firestore.doc<Group>(`Groups/${this.auth.userGroupID}`).delete().then(_ =>{
        this.removeUserGroup(this.auth.user.uid);
      });
    } else{
      this.firestore.doc<Group>(`Groups/${this.auth.userGroupID}`).update({
        users: firebase.firestore.FieldValue.arrayRemove(this.auth.user.uid)
      }).then(_ => {
        this.removeUserGroup(this.auth.user.uid);
      })
    }
  }
  removeUserGroup(uid: string){
    this.firestore.doc<User>(`users/${uid}`).update({
      group: firebase.firestore.FieldValue.delete()
    }).then(_ => {
      
      this.snackbar.open('You have been successfully removed from the group "'+ this.userGroup.name +'"',"Ok",{
        duration: 3000
      });
      this.auth.userGroupID = null;
      this.auth.userGroup = null;
      this.userGroup = null;
      this.dialogRef.close();
    })
  }

  isAlphaNumeric(str) {
    var code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123) && // lower alpha (a-z)
          !(code == 32)){ 
          
        return false;
      }
    }
    return true;
  }

  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
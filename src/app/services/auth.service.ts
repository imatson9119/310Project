import { Injectable } from '@angular/core';
import { Router } from '@angular/router';


//import { firebase } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { User } from '../shared/models/user.model';
import { switchMap } from 'rxjs/operators';
import { AngularFireModule } from '@angular/fire';
import firebase from "firebase/app"
import { Group } from '../shared/models/group.model';
import { FirestoreService } from './firestore.service';
//import { auth } from '../../../node_modules/firebase';
// You don't need to import firebase/app either since it's being imported above


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  user: any = {
    uid: null,
    email: null,
    displayName: "User Name",
    photoURL: "https://picsum.photos/200",
  };
  userGroupID: any = null;
  userGroup: Group = null;
  groupMembers: User[] = null
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private afs: FirestoreService
  ) { 
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
          // Logged in
        if (user) {
          return this.firestore.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          // Logged out
          return of(null);
        }
      })
    )
  }

  async googleSignin() {

    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.firestore.doc(`users/${user.uid}`);
    const data = { 
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName, 
      photoURL: user.photoURL,
    }
    this.user = data;
    this.afs.curUID = data.uid;
    this.userGroupID = user.group;
    this.afs.curGroupID = user.group;
    userRef.get().subscribe(userDoc => {
      this.userGroupID = userDoc.data().group;
      this.firestore.doc<Group>(`Groups/${this.userGroupID}`).get().subscribe(docRef => {
        this.userGroup = docRef.data();
        if(this.userGroup){
          this.afs.getUsers(this.userGroup.users).then(users => {
            this.groupMembers = users;
            console.log("Loaded group members!")
            this.afs.refreshExpenses();
          })
        }
        else if(this.user.uid){
          this.groupMembers = [this.user]
        }
        
      });
    })
    this.router.navigateByUrl("/recent-expenses");
    return userRef.set(data, { merge: true })

  }
  async signOut() {
    await this.afAuth.signOut();
    this.afs.curUID = null;
    this.router.navigate(['/login']);
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';


//import { firebase } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { User } from './user.model';
import { switchMap } from 'rxjs/operators';
import { AngularFireModule } from '@angular/fire';
import firebase from "firebase/app"
//import { auth } from '../../../node_modules/firebase';
// You don't need to import firebase/app either since it's being imported above


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  user: any = {
    uid: "username",
    email: null,
    displayName: "User Name",
    photoURL: "https://picsum.photos/200",
  };
  userGroup: any = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) { 
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
          // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
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
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data = { 
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName, 
      photoURL: user.photoURL
    }
    this.user = data;
    this.userGroup = user.group
    userRef.get().subscribe(userDoc => {
      this.userGroup = userDoc.data().group;
      console.log(this.userGroup);
    })
    this.router.navigateByUrl("/recent-expenses");
    return userRef.set(data, { merge: true })

  }

  async signOut() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }
}

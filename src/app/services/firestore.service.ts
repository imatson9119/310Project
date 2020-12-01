import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService{

  expenseTypes: string[] = []

  constructor(public firestore: AngularFirestore) { this.getExpenseTypes()}


  async getUsers(uids: string[]): Promise<User[]>{
    let promises = []
    uids.forEach(val => {
      promises.push(this.getUser(val));
    })
    
    return Promise.all(promises);
  }

  async getUser(uid: string): Promise<User>{
    const userRef: AngularFirestoreDocument<User> = this.firestore.doc(`users/${uid}`);
    return (await userRef.get().toPromise()).data()
  }

  getExpenseTypes(){
    this.firestore.collection("ExpenseTypes").get().subscribe(data => {
      data.docs.forEach(doc => {
        this.expenseTypes.push(doc.id);
      })
    })
  }
}

import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Expense } from '../shared/models/expense.model';
import { User } from '../shared/models/user.model';
import { AuthService } from './auth.service';
import firebase from "firebase/app";

@Injectable({
  providedIn: 'root'
})
export class FirestoreService{

  curUID = null;
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

  async createExpense(owner: string, uids: string[], amount: number, type: string, desc: string){
    let newExpense: Expense = {owner, uids, amount, type, desc};
    await this.firestore.collection<Expense>("Expenses").add(newExpense);
    let individualAmount: number = amount / uids.length;
    individualAmount = Math.round((individualAmount + Number.EPSILON) * 100) / 100;
    console.log(individualAmount);
    uids.forEach(async (uid) => {
      if (uid != this.curUID) {
        var balUpdate = {};
        
        balUpdate[`debts.${this.curUID}`] = firebase.firestore.FieldValue.increment(-individualAmount);
        await this.firestore.doc(`users/${uid}`).update(balUpdate);
      }
    });
  }
}

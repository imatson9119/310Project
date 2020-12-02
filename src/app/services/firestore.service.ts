import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Expense } from '../shared/models/expense.model';
import { User } from '../shared/models/user.model';
import { AuthService } from './auth.service';
import firebase from "firebase/app";
import { Group } from '../shared/models/group.model';
import {Budget} from '../shared/models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService{

  curUID = null;
  curGroupID = null
  expenseTypes: string[] = []
  budgets: Budget[] = []

  constructor(public firestore: AngularFirestore) { this.getExpenseTypes() , this.refreshBudget()}


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
        
        balUpdate[`debts.${this.curUID}`] = firebase.firestore.FieldValue.increment(individualAmount);
        await this.firestore.doc(`users/${uid}`).update(balUpdate);
      }
    });
    await this.settleUp(this.curGroupID);
  }
  async pay(owner: string, uids: string[], amount: number, desc: string){
    let individualAmount: number = amount / uids.length;
    individualAmount = Math.round((individualAmount + Number.EPSILON) * 100) / 100;
    uids.forEach(async (uid) => {
      if (uid != this.curUID) {
        var balUpdate = {};
        
        balUpdate[`debts.${this.curUID}`] = firebase.firestore.FieldValue.increment(individualAmount);
        await this.firestore.doc(`users/${uid}`).update(balUpdate);
      }
    });
    await this.settleUp(this.curGroupID);
  }

  async settleUp(groupID: string){
    await this.firestore.doc<Group>(`Groups/${groupID}`).get().subscribe(async docRef => {
      let uids: string[] = docRef.data().users;
      let usersArr: User[] = [];
      await this.getUsers(uids).then(u => {
        usersArr = u;
      });
      let users = {};
      uids.forEach((uid: string, i) => {
          users[uid] = usersArr[i];
          if(!users[uid].debts)
            users[uid].debts = {}
      });
      uids.forEach(uid => {
        let debts = users[uid].debts;
        for (const [debtor, debt] of Object.entries(debts)) {
          if(debt < 0){
            if(!users[debtor].debts[uid])
              users[debtor].debts[uid] = 0;
            users[debtor].debts[uid] -= users[uid].debts[debtor];
            users[uid].debts[debtor] = 0;
          }
        }
        for (const [debtor, debt] of Object.entries(debts)) {
          if(users[debtor].debts[uid] && users[debtor].debts[uid] != 0){
            users[uid].debts[debtor] -= users[debtor].debts[uid];
            users[debtor].debts[uid] = 0;
            if(users[uid].debts[debtor] < 0){
              users[debtor].debts[uid] -= users[uid].debts[debtor]
              users[uid].debts[debtor] = 0;
            }
          }
        }
      });
      for(const [uid, user] of Object.entries(users)){
        if(user['debt'] != {})
        await this.firestore.doc(`users/${uid}`).set(user);
      }
    })
  }

  async createBudget(owner: string, name: string,  amount: number, category: string, schedule: string, desc: string) {
    let newBudget: Budget = { owner, name, amount, category, schedule, desc };
    await this.firestore.collection<Budget>("Budgets").add(newBudget);
  }

  async getBudgets()
  {
    let budgets: Budget[] = [];
    await this.firestore.collection<Budget>("Budgets").get().subscribe(data => {
      data.query.where("owner", "==", this.curUID).get().then(res => {
        res.docs.forEach(docRef => {
          budgets.push(docRef.data());
          console.log(docRef.data());
        })
      })
    })
    return budgets;
  }

  async refreshBudget()
  {
    this.getBudgets().then(list => {
      this.budgets = list;
      console.log(this.budgets);
    })
    
  }


}

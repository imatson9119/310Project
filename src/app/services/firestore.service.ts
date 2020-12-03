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

  constructor(public firestore: AngularFirestore) { this.getExpenseTypes()}
  expenses: Expense[] = []
  renderedExpenses: Expense[] = [];

  async getUser(uid: string): Promise<User>{
    const userRef: AngularFirestoreDocument<User> = this.firestore.doc(`users/${uid}`);
    return (await userRef.get().toPromise()).data()
  }

  async getUsers(uids: string[]): Promise<User[]>{
    let promises = []
    uids.forEach(val => {
      promises.push(this.getUser(val));
    })
    
    return Promise.all(promises);
  }
  async getGroupMembers(gid: string): Promise<string[]>{
    return (await this.firestore.doc<Group>(`Groups/${gid}`).get().toPromise()).data().users;
  }
  refreshExpenses(){
    console.log(this.curGroupID);
    if(this.curGroupID){
      this.getExpenses(this.curGroupID).then(list => {
        this.expenses = list;
        this.renderedExpenses = list;
        this.refreshRenderedExpenses();
      })
    }
  }
  refreshRenderedExpenses(query: string = '', userMap: Object = {}){
    let renderedExpenses: Expense[] = []
    if(query == ''){
      renderedExpenses = this.expenses;
    } else{
      this.expenses.forEach(expense => {
        let text = expense.desc;
        text += " " + userMap[expense.owner].displayName + " ";
        expense.uids.forEach(uid => {
          text += " " + userMap[uid].displayName + " ";
        });
        if(text.toLowerCase().includes(query.toLowerCase())){
          renderedExpenses.push(expense);
        }
      });
    }
    this.renderedExpenses = renderedExpenses;
  }
  deleteExpense(expense: Expense){
    this.updateBalances(expense.owner,expense.uids,-expense.amount);
    this.firestore.collection<Expense>("Expenses").get().subscribe(data => {
      data.query.where("date","==",expense.date).where("owner","==",expense.owner).get().then(res => {
        res.docs.forEach(docRef => {
          this.firestore.doc(`Expenses/${docRef.id}`).delete().then(_ => {
            this.expenses.forEach((e,i) => {
              if(e.owner == expense.owner && e.date == expense.date){
                this.expenses.splice(i,1);
              }
            });
          });
        })
      })
      
    })
  }
  deleteBudget(budget: Budget){
    this.firestore.collection<Budget>("Budgets").get().subscribe(data => {
      data.query.where("dateCreated","==",budget.dateCreated).where("gid","==",budget.gid).get().then(res => {
        res.docs.forEach(docRef => {
          this.firestore.doc(`Budgets/${docRef.id}`).delete().then(_ => {
            this.budgets.forEach((b,i) => {
              if(b.gid == budget.gid && b.dateCreated == budget.dateCreated){
                this.budgets.splice(i,1);
              }
            });
          });
        })
      })
      
    })
  }
  async getExpenses(gid: string){
    let expenses: Expense[] = []
    await this.firestore.collection<Expense>("Expenses").get().subscribe(data => {
      data.query.where("gid","==",this.curGroupID).orderBy("date","desc").get().then(res => {
        res.docs.forEach(docRef => {
          expenses.push(docRef.data());
        })
      })
      
    })
    return expenses;
  }

  getExpenseTypes(){
    this.firestore.collection("ExpenseTypes").get().subscribe(data => {
      data.docs.forEach(doc => {
        this.expenseTypes.push(doc.id);
      })
    })
  }
  async updateBalances(owner: string, uids: string[], amount: number){
    let individualAmount: number = amount / uids.length;
    individualAmount = Math.round((individualAmount + Number.EPSILON) * 100) / 100;
    await uids.forEach(async (uid) => {
      if (uid != owner) {
        var balUpdate = {};
       // console.log(individualAmount + " to " + uid);
        balUpdate[`debts.${owner}`] = firebase.firestore.FieldValue.increment(individualAmount);
        await this.firestore.doc(`users/${uid}`).update(balUpdate).then(_ => this.settleUp(this.curGroupID));
      }
    });
  }
  async createExpense(owner: string, uids: string[], amount: number, type: string, desc: string, gid: string){
    let date: Date = new Date();  
    let newExpense: Expense = {owner, uids, amount, type, desc, date ,gid};
    await this.firestore.collection<Expense>("Expenses").add(newExpense);
    await this.updateBalances(owner,uids,amount);
    this.expenses.unshift(newExpense);
    this.refreshRenderedExpenses();
  }
  
  async pay(owner: string, uids: string[], amount: number, desc: string){
    this.updateBalances(owner,uids,amount);
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
            //console.log("Negative debt of " + debt + " to " + debtor + " found for user " + uid + ". Switching.")
            if(!users[debtor].debts[uid])
              users[debtor].debts[uid] = 0;
            users[debtor].debts[uid] -= users[uid].debts[debtor];
            users[uid].debts[debtor] = 0;
          }
        }
        for (const [debtor, debt] of Object.entries(debts)) {
          if(users[debtor].debts[uid] && users[debtor].debts[uid] != 0){
            //console.log("Subtracting " + debtor + "'s debt of" + users[debtor].debts[uid] + " from " + uid);
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

  async createBudget(gid: string, name: string,  amount: number, category: string, schedule: string, desc: string) {
    let dateCreated = new Date();
    let newBudget: Budget = { gid, name, amount, category, schedule, desc, dateCreated};
    await this.firestore.collection<Budget>("Budgets").add(newBudget).then(_ => {
      this.budgets.unshift(newBudget);
    });
  }

  async getBudgets()
  {
    let budgets: Budget[] = [];
    await this.firestore.collection<Budget>("Budgets").get().subscribe(data => {
      data.query.where("gid", "==", this.curGroupID).get().then(res => {
        res.docs.forEach(docRef => {
          budgets.push(docRef.data());
        })
      })
    })
    return budgets;
  }

  async refreshBudgets()
  {
    this.getBudgets().then(list => {
      this.budgets = list;
    })
  }


  async removeUserDebts(uid: string){
    await this.firestore.doc(`users/${uid}`).update({
      debts: firebase.firestore.FieldValue.delete()
    });
  }
  async removeUserDebtsFromGroup(uid: string, gid: string){
    await this.removeUserDebts(uid);
    await this.firestore.doc<Group>(`Groups/${gid}`).get().subscribe(async docRef => {
      let uids: string[] = docRef.data().users;
      let usersArr: User[] = [];
      await this.getUsers(uids).then(u => {
        usersArr = u;
      });
      let users = {};
      uids.forEach((user: string, i) => {
          users[user] = usersArr[i];
          if(!users[user].debts)
            users[user].debts = {}
      });
      uids.forEach(user => {
        delete users[user].debts[uid]
      });
      for(const [uid, user] of Object.entries(users)){
        if(user['debt'] != {})
        await this.firestore.doc(`users/${uid}`).set(user);
      }
    });
  }
}

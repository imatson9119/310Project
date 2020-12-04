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
  budgetSpending: number[] = [];
  timeIntervals: Object = {
    "weekly": 7,
    "biWeekly": 14,
    "monthly": 31,
    "annually": 365
  }

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
    //console.log(this.getLastMonthExpenses());
   
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
    console.log(this.getThisMonthExpenses());
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
                this.budgetSpending.splice(i,1);
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
      this.budgetSpending.unshift(this.getIndividualBudgetSpending(newBudget));
    });
    return newBudget;
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
  getBudgetSpending(){
    this.budgets.forEach((b,i) => {
      this.budgetSpending[i] = this.getIndividualBudgetSpending(b);
    });
  }
  getIndividualBudgetSpending(b: Budget){
    let totalSpent = 0;
    for(let j = 0; j < this.expenses.length; j++){
      let e = this.expenses[j];
      if(!this.inRange(b.schedule,e.date)){
        //console.log(e);
        break;
      }
      //console.log("Evaluating expense for equality to " + b.category);
      if(e.type == b.category){
        totalSpent+= e.amount;
      }
    }
    return totalSpent;
  }

  inRange(interval: string,date: any){
    const diffTime = Math.abs(date.seconds - ((new Date()).getTime()/1000));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= this.timeIntervals[interval]; 
  }

  getLastMonthExpenses(){
     var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
     var now = new Date();
     var thisMonth = months[now.getMonth()];
     var totalLastMonth = 0;
     for(var i = 0; i < this.expenses.length; i++)
     {
       if (this.expenses[i].date.getMonth() == (thisMonth - 1)){
          totalLastMonth = totalLastMonth + this.expenses[i].amount;
       }
     }
     return totalLastMonth;
  }

  getThisMonthExpenses(){
    //var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    console.log("AHH");
    let transDate = new Date (this.expenses[0].date).toDateString();
    //console.log(this.expenses[0].date.toDateString());
    console.log(transDate);

    var now = new Date();
    //var thisMonth = now.getDay();
    console.log(now.getDate());
    var totalThisMonth = 0;
    console.log(this.expenses.length);
    var i = 0;
    //while ( i < now.getDate() ) {
    console.log(this.expenses[i].amount);
    for(var i = 0; i < this.expenses.length; i++)
    {
      //if(this.expenses[i].date. / (1000 * 60 * 60 * 24))
    }
    if(this.expenses[i].uids.includes(this.curUID))
    { 
      totalThisMonth = totalThisMonth + this.expenses[i].amount;
      console.log(totalThisMonth);
    }
    
    /*
    if (this.expenses[i].date.getMonth() == (thisMonth)) {
      totalThisMonth = totalThisMonth + this.expenses[i].amount;
    }
    */
    //}
    console.log(totalThisMonth);
    return totalThisMonth;
  }

  compareMonths(){
    return (this.getThisMonthExpenses() - this.getLastMonthExpenses());
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

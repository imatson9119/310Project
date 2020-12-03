import { Component, OnInit } from '@angular/core';
import { MatHint } from '@angular/material/form-field';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  outgoingDebt: Object[] = [];
  incomingDebt: Object[] = [];
  debtTotal: number = 0;
  userMap: Object = null;
  netDebts: Object = null;
  uids: string[];

  groupMaxDebt: number = 0;

  constructor(public auth: AuthService, public afs: FirestoreService) {  }

  ngOnInit(): void {
    this.getDebts();
  }
  getNetDebts(){
    let netDebts = {};
    Object.keys(this.userMap).forEach(uid => {
      let netDebt: number = 0;
      if(this.userMap && this.userMap[uid]){
        for (const user of Object.values(this.userMap)) {
          if(user.uid == uid){
            for (const debt of Object.values(user.debts)) {
              netDebt += Number(debt);
            };
          }
          else{
            for (const [debtor,debt] of Object.entries(user.debts)) {
              
              if(debtor == uid){
                netDebt -= Number(debt);
              } else{
              }
            };
          }
        }
      }
      netDebts[uid] = netDebt;
      this.groupMaxDebt = Math.max(Math.abs(netDebt), this.groupMaxDebt);
    });
    this.netDebts = netDebts;
  }
  getBarStyle(debt: number){
    let style = ""
    if(debt > 0){
      style += "left: 0; background-color: #b75858";
    }
    if(debt < 0){
      style += "right: 0; background-color: #6b946b"
    }
    if(debt == 0){
      style += "visibility: hidden";
    }
    return style;
  }
  getContainerStyle(debt: number){
    if(this.groupMaxDebt == 0){
      return "width: 0%";
    }
    let width = Math.abs(debt) / this.groupMaxDebt * 95;
    let style = "width: " + width + "%;"
    return style;
  }
  getTextStyle(debt: number, i){
    let style = ""
    let text = document.getElementById('text' + i);
    let elementWidth = 100;
    if(text){
      elementWidth = document.getElementById('text' + i).offsetWidth;
    }
    let width = elementWidth / 2 + 40;
    if(debt > 0){
      style += "transform: translate(" + width + "px,0px); color: #b75858;";
    }
    if(debt < 0){
      style += "transform: translate(" + -width + "px,0px); color: #6b946b;"
    }
    if(debt == 0){
      style += "transform: translate(" + -width + "px,0px); color: rgba(0, 0, 0, 0.7);";
    }
    return style;
  }
  getPosDebt(uid: string){
    if(this.netDebts[uid]){
      return Math.abs(this.netDebts[uid]);
    }
    return 0;
  }
  getDebts(){
    if(!this.auth.user.uid){
      return;
    }
    this.afs.getGroupMembers(this.auth.userGroupID).then(uids => {
      this.uids = uids;
      this.afs.getUsers(uids).then(members => {

        let userMap = {}
        members.forEach((m,i) => {
          userMap[uids[i]] = m;
        })
        this.userMap = userMap;
        this.getNetDebts();
        let userDebts = userMap[this.auth.user.uid].debts;
        if(userDebts){
          for (const [debtor, debt] of Object.entries(userDebts)) {
            if(debt > 0){
            this.debtTotal += Number(debt);
              this.outgoingDebt.push({
                debt: debt,
                name: this.auth.getGroupMember(debtor).displayName
              })
            }
          }
        }
        members.forEach(m => {
          if(m.debts){
            for (const [debtor, debt] of Object.entries(m.debts)) {
              if(debt > 0 && debtor == this.auth.user.uid){
                this.debtTotal -= Number(debt);
                this.incomingDebt.push({
                  debt: debt,
                  name: m.displayName
                });
              }
            }
          }
        });

      });
    });
    
  }

  
}

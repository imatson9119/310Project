import { Component, OnInit } from '@angular/core';
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

  constructor(public auth: AuthService, public afs: FirestoreService) { this.getDebts(); }

  ngOnInit(): void {
    
  }
  
  getDebts(){
    if(!this.auth.user.uid){
      return;
    }
    this.afs.getGroupMembers(this.auth.userGroupID).then(uids => {
      this.afs.getUsers(uids).then(members => {

        let userMap = {}
        members.forEach((m,i) => {
          userMap[uids[i]] = m;
        })
        
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

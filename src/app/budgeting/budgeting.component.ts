import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-budgeting',
  templateUrl: './budgeting.component.html',
  styleUrls: ['./budgeting.component.scss']
})
export class BudgetingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

        document.getElementById("myBtn").addEventListener("click", myFunction);

        function myFunction() {

            var para = document.createElement("mat-card");
            para.className = "card";
            var para2 = document.createElement("p");
            var node = document.createTextNode("This is new.");
            
            para2.appendChild(node);
            para.appendChild(para2);

            var element = document.getElementById("cardContainer");
            element.appendChild(para2);
        }






  }


  addCard(){}

  clearCards(){}

}



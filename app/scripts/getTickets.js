/* global SW:true */  

$(document).ready(function(){
  'use strict';
  console.log( 'Doing SW things!' );
  var card = new SW.Card();
  var helpdesk = card.services('helpdesk');
  var assignmentCount = {};
  helpdesk
    .request('tickets')
    .then( function(data){
      console.log( 'got data!' );
      $.each(data.tickets, function(index, ticket){
        console.log( ticket.assignee.id );
        if (assignmentCount[ticket.assignee.id]){
          assignmentCount[ticket.assignee.id] += 1;
        } else {
          assignmentCount[ticket.assignee.id] = 1;
        }
        console.log( 'assignmentCount object' );
        console.log( assignmentCount );
      });

      console.log( assignmentCount + 'final' );
      var ticketTotal = 0;
      for (var property in assignmentCount) {
          ticketTotal += assignmentCount[property];
      }
      var unassignedTickets = data.tickets.length - ticketTotal;
      console.log('unassignedTickets');
      console.log(unassignedTickets);
    });

});
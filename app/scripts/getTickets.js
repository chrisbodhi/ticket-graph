/* global SW:true */  

var getUnassigned = function (assignmentCount) {
  var ticketTotal = 0;
  for (var property in assignmentCount) {
    ticketTotal += assignmentCount[property];
  }
  var unassignedTickets = data.tickets.length - ticketTotal;
  console.log('unassignedTickets');
  return unassignedTickets;
}

var countAssignments = function(ticket){
  if (assignmentCount[ticket.assignee.id]){
    assignmentCount[ticket.assignee.id] += 1;
  } else {
    assignmentCount[ticket.assignee.id] = 1;
  }
};

$(document).ready(function(){
  'use strict';
  console.log( 'Doing SW things!' );
  var card = new SW.Card();
  var helpdesk = card.services('helpdesk');
  var assignmentCount = {};
  helpdesk.request('tickets')
    .then( function(data){
      $.each(data.tickets, function(index, ticket){
        countAssignments(ticket);
      });
    console.log( assignmentCount + 'final' );
    getUnassigned(assignmentCount);
    });

});
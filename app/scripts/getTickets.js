/* global SW:true */  

var assignedTix = {},
    tixCount = 0,
    unassignedTix = [];

var appendTicket = function(ticket) {
  'use strict';
  if (ticket.status == 'open') {
    $('.jumbotron').append('<p>' + ticket.id + ' appended for you!</p>');
    console.log(ticket);
  }
};

var determineAssignments = function(ticket){
  'use strict';
  if (assignedTix[ticket.assignee.id]){
    assignedTix[ticket.assignee.id] += 1;
  } else if {
    assignedTix[ticket.assignee.id] = 1;
  } else {
    unassignedTix.concat(ticket.id);
  }
};

$(document).ready(function() {
  'use strict';
  console.log('Doing SW things!');
  var card = new SW.Card();
  var helpdesk = card.services('helpdesk');
  helpdesk.request('tickets')
    .then(function(data) {
      tixCount = data.tickets.length;
      console.log(tixCount);
      $.each(data.tickets, function(index, ticket) {
        appendTicket(ticket);
        determineAssignments(ticket);
      });
    });
});


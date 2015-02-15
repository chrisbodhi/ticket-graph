/* global SW:true */  

$(document).ready(function(){
  'use strict';
  console.log( 'Doing SW things!' );
  var card = new SW.Card();
  var helpdesk = card.services('helpdesk');
  helpdesk
    .request('tickets')
    .then( function(data){
      console.log( 'got data!' );
      var ticketCount = {};
      $.each(data.tickets, function(index, ticket){
        console.log( index );
        if (ticketCount[ticket.assignee.id]){
          ticketCount[ticket.assignee.id] += 1;
        } else {
          ticketCount[ticket.assignee.id] = 1;
        }
        console.log( 'ticketCount object' );
        console.log( ticketCount );
      });
    });
});
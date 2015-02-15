$(document).ready(function(){
  var card = new SW.Card();
  var tix = card.services('helpdesk');
  tix.request('tickets')
    .then( function(data){
      $.each(data.tickets, function(index, ticket){
        $('body').append('<h4>id: ' + ticket.assignee.id + '</h4>'
                  + '<h4>name: ' + ticket.assignee.first_name + ' ' 
                  + ticket.assignee.last_name + '</h4>'
                  + '<h4>role: ' + ticket.assignee.role + '</h4>'
                  + '<h4>url: ' + ticket.assignee.url + '</h4>'
        );
      });
    });
});
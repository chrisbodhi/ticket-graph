/* global RSVP:true */
/* global SW:true */
'use strict';

var assigneeIds     = [],
    dataArray       = [], // this will be passed to D3
    ticketsToChart  = [];

var callSW = function(){
  var promise = new RSVP.Promise(function(resolve, reject){
    var card = new SW.Card();
    var helpdesk = card.services('helpdesk');
    helpdesk.request('tickets')
      .then(function(data) {
        if (data.tickets.length > 0){
          resolve(data.tickets);
        } else {
          reject('err');
        }
      });
    });
  return promise;
};

///////////////////////////////////////////////////////////////////////////////
// Get the tickets we want to chart
callSW().then(function(allTickets){
  ticketsToChart = allTickets.filter(function(ticket, index, arr){
    if (ticket.status === 'open' && ticket.assignee) { return ticket; }
  });
  ///////////////////////////////////////////////////////////////////////////////
  // Get an array of the assignees
  assigneeIds = ticketsToChart.map(function(ticket, index, arr){
    return ticket.assignee.id;
  });
  // http://stackoverflow.com/a/9229821/2276791
  var uniqIds = function(a) {
    var seen  = {},
        out   = [],
        len   = a.length,
        j     = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
  };
  assigneeIds = uniqIds(assigneeIds);
  // END

  var calcDaysOpen = function(time){
    var floatDays = (Date.now() - new Date(time))/(1000*60*60*24);
    return Math.floor(floatDays);
  };

  var getTicketData = function(t){
    var info = {};
    info.ticketId = t.id;
    info.priority = t.priority;
    info.daysOpen = calcDaysOpen(t.created_at);
    info.reopened = t.reopened;
    return info;
  };

  var theirTickets = function(assigneeId){
    return ticketsToChart.filter(function(t, index, arr){
      if (assigneeId === t.assignee.id){
        return t;
      } 
    });
  };

  assigneeIds.forEach(function(a){
    var bucket = { 
                  'assigneeId': a,
                  'assigneeName': '', 
                  'tickets': [] 
                };
    var theseTickets = theirTickets(a);
    theseTickets.forEach(function(t){
      bucket.tickets.push(getTicketData(t));
    });
    dataArray.push(bucket);
    bucket = {};
  });
  
  console.log(dataArray);

  var priorities = []; // PRIORITIES!

  dataArray.forEach(function(d){
    var lowCount = d.tickets.filter(function(t,index,arr){
      if (t.priority === 1){return 1; }
    }).length;
    var medCount = d.tickets.filter(function(t,index,arr){
      if (t.priority === 2){return 1; }
    }).length;
    var highCount = d.tickets.filter(function(t,index,arr){
      if (t.priority === 3){return 1; }
    }).length;
    priorities.push({'id': d.assigneeId, counts: {
      'lowCount': lowCount,
      'medCount': medCount,
      'highCount': highCount
    }});
  });

  console.log(priorities);
});


// DONE filter for status: "open"
// DONE filter for assigned
// DONE filter for ticket.assignee.ids
// count each ticket.priority per ticket.assignee.id




/*
var url = 'scripts/tickets.json';
var res = $.getJSON(url);
// then...
var allTix = res.responseJSON
*/



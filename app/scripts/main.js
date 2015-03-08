/* global d3:true */
/* global RSVP:true */
/* global SW:true */
'use strict';

///////////////////////////////////////////////////////////////////////////////
// START TICKET FILTERING
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

////////////////////////////////////
// Get the tickets we want to chart
callSW().then(function(allTickets){
  ticketsToChart = allTickets.filter(function(ticket, index, arr){
    if (ticket.status === 'open' && ticket.assignee) { return ticket; }
  });
  ////////////////////////////////
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

  var graphData = [];
  var width = 500,
      height = 500;

  graphData = dataArray.map(function(e,i,arr){
    return e.tickets.length;
  });

  var widthScale = d3.scale.linear()
                    .domain([0, Math.max.apply(0, graphData)])
                    .range([0, width]);

  var heightScale = (graphData.length * 100);

  // Suitable for gradient based on age?
  // var color = d3.scale.linear()
  //               .domain([0, Math.max.apply(0, graphData)])
  //               .range(['lightblue', 'dodgerblue']);

  var axis = d3.svg.axis()
                .ticks(5) // total number of ticks
                .scale(widthScale);

  var canvas = d3.select('.jumbotron')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', Math.max(height, heightScale))
                  .append('g') //group the rects on the canvas
                  .attr('transform', 'translate(20, 0)');

  var bars = canvas.selectAll('rect')
                   .data(graphData)
                   .enter()
                   .append('rect')
                   .attr('width', function (d) { return widthScale(d); })
                   .attr('height', 50)
                   .attr('fill', 'dodgerblue')
                   .attr('y', function (d,i) { return i * 100; });

  // Rather than making the canvas variable more clunky, separate concerns!
  canvas.append('g')
        .attr('transform', 'translate(0, ' + (heightScale - 20) + ')')
        .call(axis);

});
// END TICKET FILTERING AKA GIANT PROMISE RESOLUTION
///////////////////////////////////////////////////////////////////////////////



// Reference on tooltips
  // var tooltip = d3.select('#chart')
  //                 .append('div')
  //                 .attr('class', 'd3-tooltip');

  // tooltip.append('div')
  //        .attr('class', 'label');

  // tooltip.append('div')
  //        .attr('class', 'count');

  // tooltip.append('div')
  //        .attr('class', 'percent');

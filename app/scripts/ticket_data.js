/* global d3:true */
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
// DONE count each ticket.priority per ticket.assignee.id

var ticketCounts = [
  {
    id: 29, 
    counts: { 
      highCount: 1, 
      lowCount: 1, 
      medCount: 3
    }
  },
  {
    id: 3, 
    counts: { 
      highCount: 2,
      lowCount: 0,
      medCount: 3
    }
  }, 
  {
    id: 2,
    counts: { 
      highCount: 0,
      lowCount: 1,
      medCount: 3
    }
  }
];

var stackData = [],
    lowData = [],
    medData = [],
    highData = [];

ticketCounts.forEach(function(tc, i){
  lowData.push({'x': i, 'y': tc.counts.lowCount});
  medData.push({'x': i, 'y': tc.counts.medCount});
  highData.push({'x': i, 'y': tc.counts.highCount});
});

stackData.push(lowData);
stackData.push(medData);
stackData.push(highData);

var width = 500,
    height = 500;

var stack = d3.layout.stack();
stack(stackData);

var widthScale = d3.scale.linear()
                  .domain([0, Math.max.apply(0, [10])])
                  .range([0, width]);

var heightScale = (stackData.length * 100);

//Set up scales
var xScale = d3.scale.ordinal()
  .domain(d3.range(stackData[0].length))
  .rangeRoundBands([0, width], 0.05);

var yScale = d3.scale.linear()
  .domain([0,       
    d3.max(stackData, function(d) {
      return d3.max(d, function(d) {
        return d.y0 + d.y;
      });
    })
  ])
  .range([0, height]);
        
//Easy colors accessible via a 10-step ordinal scale
var colors = d3.scale.category10();

var axis = d3.svg.axis()
              .ticks(5) // total number of ticks
              .scale(widthScale);

var canvas = d3.select('.jumbotron')
                .append('svg')
                .attr('width', width)
                .attr('height', Math.max(height, heightScale))
                .append('g') //group the rects on the canvas
                .attr('transform', 'translate(20, 0)');

// Add a group for each row of data
var groups = canvas.selectAll("g")
                .data(stackData)
                .enter()
                .append("g")
                .style("fill", function(d, i) {
                  return colors(i);
                });

var rects = groups.selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
                return xScale(i);
        })
        .attr("y", function(d) {
                return yScale(d.y0);
        })
        .attr("height", function(d) {
                return yScale(d.y);
        })
        .attr("width", xScale.rangeBand());


// var bars = canvas.selectAll('rect')
//                  .data(stackData)
//                  .enter()
//                  .append('rect')
//                  .attr('width', function (d) { return widthScale(d); })
//                  .attr('height', 50)
//                  .attr('fill', 'dodgerblue')
//                  .attr('y', function (d,i) { return i * 100; });

// Rather than making the canvas variable more clunky, separate concerns!
canvas.append('g')
      .attr('transform', 'translate(0, ' + (heightScale - 20) + ')')
      .call(axis);



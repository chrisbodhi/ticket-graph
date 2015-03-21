/* global d3:true */
/* global RSVP:true */
/* global SW:true */
'use strict';

///////////////////////////////////////////////////////////////////////////////
// START TICKET FILTERING
var dataArray       = [], // this will be passed to D3
    ticketsToChart  = [];

// Calculate the days a ticket has been open
var calcDaysOpen = function(time){
  var floatDays = (Date.now() - new Date(time))/(1000*60*60*24);
  return Math.floor(floatDays);
};

// Pull out relevant bits of the ticket in question
var getTicketData = function(t){
  var info = {};
  info.ticketId = t.id;
  info.priority = t.priority;
  info.daysOpen = calcDaysOpen(t.created_at);
  info.reopened = t.reopened;
  return info;
};

// Ticket priorities holder
var priorities = [
  { priority: 'Low', 
    data: []
  },
  { priority: 'Medium', 
    data: []
  },
  { priority: 'High', 
    data: []}
];

var getCount = function (data, priorityInt) {
  return data.tickets.filter( function(t,index,arr) {
    if ( t.priority === priorityInt ){ return 1; }
  }).length;
};

var assignPriorities = function(lowCount, medCount, highCount){
  priorities.forEach(function(p){
    if (p.priority === 'Low'){
      p.data.push({'count': lowCount });
    } else if (p.priority === 'Medium'){
      p.data.push({'count': medCount });
    } else if (p.priority === 'High'){
      p.data.push({'count': highCount });
    } else {
      console.error('No priority noted for ticket.');
    }
  });
};

var getUser = function(){
  var promise = new RSVP.Promise(function(resolve, reject){
    var card = new SW.Card();
    card.services('environment').request('environment')
        .then(function(data){
          if (data.user){
            resolve(data.user);
          } else {
            reject('err');
          }
        });
  });
  return promise;
};

var getMyTickets = function(user){
  var promise = new RSVP.Promise(function(resolve, reject){
    var card = new SW.Card();
    card.services('helpdesk').request('tickets', { assignee: user.id, status: 'open' })
        .then(function(data){
          if (data.tickets.length > 0){
            resolve(data.tickets);
          } else {
            reject('err');
          }
        });
  });
  return promise;
};

var readyTheTickets = function(tickets){
  console.log(tickets.length);
  // var promise = new RSVP.Promise(function(resolve, reject){
    myTickets.forEach(function(t){
      dataArray.push(getTicketData(t));
    });
    // Prepare the data for processing by D3
    dataArray.forEach(function(d){
      var lowCount  = getCount(d, 1),
          medCount  = getCount(d, 2),
          highCount = getCount(d, 3);    
      assignPriorities(lowCount, medCount, highCount);
    });
    console.log(priorities);
    // resolve(priorities);
  // });
  // return promise;
};

var graphMaker = function(priorities){
  // var promise = new RSVP.Promise(function(resolve, reject){
    console.log('graphMaker called');
    console.log(priorities);
  //   if (data.tickets.length > 0){
  //     resolve(data.tickets);
  //   } else {
  //     reject('err');
  //   }
  // });
  // return promise;
};

var logging = function(data){console.log('logged ' + data.length)};

getUser()
  .then(getMyTickets)
  .then(logging)
  .then(readyTheTickets)
  .then(graphMaker);
  
//   // ...and here
//   var stackData = priorities.map(function (d){
//     return d.data.map(function (t, i){
//       return {
//         y: t.count
//       };
//     });
//   });

//   ///////////////////////////////////////////////////////////////////////////////
//   // GRAPH MAKING
//   var width = 600,
//       height = 500;


//   var stack = d3.layout.stack();

//   stack(stackData);

//   stackData = stackData.map(function (group) {
//     return group.map(function (d) {
//       // Invert the x and y values, and y0 becomes x0
//       return {
//         x: d.y,
//         y: d.x,
//         x0: d.y0
//       };
//     });
//   });

//   //Set up scales
//   var xMax = d3.max(stackData, function (group) {
//       return d3.max(group, function (d) {
//         return d.x + d.x0;
//       });
//   });

//   var xScale = d3.scale.linear()
//           .domain([0, xMax])
//           .range([0, width]);

//   // todo: programatically get names into an array
//   var names = [29, 3, 2];        
//   // var names = ['Alice', 'Bob', 'Carol'];        

//   var yScale = d3.scale.ordinal()
//           .domain(names)
//           .rangeRoundBands([0, height], 0.1);
          
//   var colors = d3.scale.category10();

//   var canvas = d3.select('.jumbotron')
//                   .append('svg')
//                   .attr('width', width + 60)
//                   .attr('height', height)
//                   .append('g') //group the rects on the canvas
//                   .attr('transform', 'translate(20, 0)');

//   // Add a group for each row of data
//   var groups = canvas.selectAll('g')
//                   .data(stackData)
//                   .enter()
//                   .append('g')
//                   .style('fill', function(d, i) {
//                     return colors(i);
//                   });

//   var rects = groups.selectAll('rect')
//           .data(function(d) { return d; })
//           .enter()
//           .append('rect')
//           .attr('x', function(d) {
//                   return xScale(d.x0);
//           })
//           .attr('y', function(d) {
//                   return yScale(d.y);
//           })
//           .attr('height', function (d) {
//             return yScale.rangeBand();
//           })
//           .attr('width', function(d) {
//                   return xScale(d.x); 
//           })
//           .on('mouseover', function (d) {
//             var xPos = parseFloat(d3.select(this).attr('x')) + width;
//             var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand();
//             console.log(xPos);
//             console.log(yPos);
//             d3.select('#d3-tooltip')
//                 .style('left', (xPos - (width / 2)) + 'px')
//                 .style('top', yPos + 'px')
//                 .select('#value')
//                 .text(d.x);
//             d3.select('#d3-tooltip').classed('hidden', false);
//         })
//         .on('mouseout', function () {
//           d3.select('#d3-tooltip').classed('hidden', true);
//         });

//   // Axis, no Allies
//   var xAxis = d3.svg.axis()
//       .scale(xScale)
//       .ticks(stackData[0].length)
//       .orient('bottom');

//   var yAxis = d3.svg.axis()
//       .scale(yScale)
//       .orient('left');  

//   canvas.append('g')
//       .attr('class', 'axis')
//       .attr('transform', 'translate(0,' + (height - 17) + ')')
//       .call(xAxis);

//   canvas.append('g')
//       .attr('class', 'axis')
//       .call(yAxis); 
// });

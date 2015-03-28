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
// for testing locally
// ok that it's flipped in priority locally
// var priorities = [
//   { priority: 'High', 
//     data: [{'count': 1 }]
//   },
//   { priority: 'Medium', 
//     data: [{'count': 4 }]
//   },
//   { priority: 'Low', 
//     data: [{'count': 2 }]
//   }
// ];
var priorities = [
  { priority: 'High', 
    data: []
  },
  { priority: 'Medium', 
    data: []
  },
  { priority: 'Low', 
    data: []
  }
];

var getCount = function (data, priorityInt) {
  return data.filter(function(t,index,arr) {
    if ( t.priority === priorityInt ){ return 1; }
  }).length;
};

var assignPriorities = function(lowCount, medCount, highCount){
  priorities.forEach(function(p){
    if (p.priority === 'High'){
      p.data.push({'count': highCount });
    } else if (p.priority === 'Medium'){
      p.data.push({'count': medCount });
    } else if (p.priority === 'Low'){
      p.data.push({'count': lowCount });
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
  var promise = new RSVP.Promise(function(resolve, reject){  
    tickets.forEach(function(t){
      dataArray.push(getTicketData(t));
    });
    // Prepare the data for processing by D3
    var lowCount  = getCount(dataArray, 3),
        medCount  = getCount(dataArray, 2),
        highCount = getCount(dataArray, 1);    
    assignPriorities(lowCount, medCount, highCount);
    if (priorities){
      resolve(priorities);
    } else {
      reject('errrrrrr');
    }
  });
  return promise;
};

// No need to return a promise if it's the last `then` in the chain
// for testing locally
// var graphMaker = function(priorities){
var graphMaker = function(){
  var stackData = priorities.map(function (d){
    return d.data.map(function (t, i){
      return {
        x: 1,
        priority: d.priority,
        y: t.count        
      };
    });
  });

  /////////////////////////////////////////////////////////////////////////////
  // GRAPH MAKING
  var width = 200,
      height = 400;

  var stack = d3.layout.stack();

  stack(stackData);

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
    .range([height, 0]);
    
  //Create SVG element
  var svg = d3.select('.jumbotron')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  .append('g') //group the rects on the svg
                  .attr('transform', 'translate(20, 5)');
  
  // Add a group for each row of data
  var groups = svg.selectAll('g')
    .data(stackData)
    .enter()
    .append('g');
  
  // Add a rect for each data value
  var rects = groups.selectAll('rect')
    .data(function(d) { return d; })
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return xScale(i);
    })
    .attr('y', function(d) {
      return 400 - yScale(d.y0);
    })
    .attr('height', function(d) {
      return 400 - yScale(d.y);
    })
    .attr('width', width * 0.8)
    .attr('fill', function(d) {
      return 'rgba(255, 102, 0, ' + (1 - ((d.y + d.y0) / 10)) + ')';
    })
    .on('mouseover', function (d) {
      var xPos = parseFloat(d3.select(this).attr('x'));
      var yPos = parseFloat(d3.select(this).attr('y'));
      d3.select('#d3-tooltip')
          .style('left', (xPos + (width / 2)) + 'px')
          .style('top', (yPos + (height / 4)) + 'px')
          .select('#value')
          .text(d.priority + ': ' + d.y);
      d3.select('#d3-tooltip').classed('hidden', false);
    })
    .on('mouseout', function () {
      d3.select('#d3-tooltip').classed('hidden', true);
    });

  // Add a label to each ticket block
  var labels = svg.selectAll('text')
     .data(stackData)
     .enter()
     .append('text')
     .text(function(d){
       return d[0].y;    
     })
     .attr('x', (width * 0.8) / 2) // Width of 'g' element
     .attr('y', function(d){
        return 430-yScale(d[0].y0); })
     .attr('font-family', 'sans-serif')
     .attr('font-size', '21px')
     .attr('fill', '#eeeeee')
     .classed('shadow', true);

  // Axis, no Allies
  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');  

  svg.append('g')
      .attr('class', 'footer-axis')
      .call(yAxis); 
};

getUser()
  .then(getMyTickets)
  .then(readyTheTickets)
  .then(graphMaker);

// for testing locally
// graphMaker(priorities);


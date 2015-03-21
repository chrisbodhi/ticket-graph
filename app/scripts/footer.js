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
    data: [{'count': 2 }]
  },
  { priority: 'Medium', 
    data: [{'count': 4 }]
  },
  { priority: 'High', 
    data: [{'count': 1 }]
  }
];
// var priorities = [
//   { priority: 'Low', 
//     data: []
//   },
//   { priority: 'Medium', 
//     data: []
//   },
//   { priority: 'High', 
//     data: []}
// ];

var getCount = function (data, priorityInt) {
  return data.filter(function(t,index,arr) {
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
  var promise = new RSVP.Promise(function(resolve, reject){  
    tickets.forEach(function(t){
      dataArray.push(getTicketData(t));
    });
    // Prepare the data for processing by D3
    var lowCount  = getCount(dataArray, 1),
        medCount  = getCount(dataArray, 2),
        highCount = getCount(dataArray, 3);    
    assignPriorities(lowCount, medCount, highCount);
    console.log(priorities);
    if (priorities){
      resolve(priorities);
    } else {
      reject('errrrrrr');
    }
  });
  return promise;
};

// No need to return a promise if it's the last `then` in the chain
var graphMaker = function(priorities){
  console.log('graphMaker called');
  var stackData = priorities.map(function (d){
    return d.data.map(function (t, i){
      return {
        x: 1,
        y: t.count        
      };
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  // GRAPH MAKING
  var width = 300,
      height = 500;

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
    .range([0, height]);
    
  //Easy colors accessible via a 10-step ordinal scale
  var colors = d3.scale.category10();
  
  //Create SVG element
  var svg = d3.select('.jumbotron')
                  .append('svg')
                  .attr('width', width + 60)
                  .attr('height', height)
                  .append('g') //group the rects on the svg
                  .attr('transform', 'translate(20, 0)');
  
  // Add a group for each row of data
  var groups = svg.selectAll("g")
    .data(stackData)
    .enter()
    .append("g")
    .style("fill", function(d, i) {
      return colors(i);
    });
  
  // Add a rect for each data value
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
    .attr("width", xScale.rangeBand())
    .on('mouseover', function (d) {
      var xPos = parseFloat(d3.select(this).attr('x'));
      var yPos = parseFloat(d3.select(this).attr('y'));
      console.log(xPos);
      console.log(yPos);
      d3.select('#d3-tooltip')
          .style('left', (xPos + width) + 'px')
          .style('top', yPos + (height / 4) + 'px')
          .select('#value')
          .text(d.y);
      d3.select('#d3-tooltip').classed('hidden', false);
    })
    .on('mouseout', function () {
      d3.select('#d3-tooltip').classed('hidden', true);
    });

  // Axis, no Allies
  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');  

  svg.append('g')
      .attr('class', 'axis')
      .call(yAxis); 
};

var logging = function(data){console.log('logged ' + data.length);};
// .then(logging)

// getUser()
//   .then(getMyTickets)
//   .then(readyTheTickets)
//   .then(graphMaker);

graphMaker(priorities);


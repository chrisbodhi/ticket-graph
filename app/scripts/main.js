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

var getOpenTickets = function(){
  var promise = new RSVP.Promise(function(resolve, reject){
    var card = new SW.Card();
    card.services('helpdesk').request('tickets', { status: 'open' })
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

var getUnassigned = function(openTickets){
  var promise = new RSVP.Promise(function(resolve, reject){
    resolve(openTickets.filter(function(t,index,arr){
      if (!t.assignee){ return t; }
    }));
  });
  return promise;
};

var unass = getOpenTickets().then(getUnassigned);

////////////////////////////////////
// Get the tickets we want to chart
callSW().then(function(allTickets){
  ticketsToChart = allTickets.filter(function(ticket, index, arr){
    if (ticket.status !== 'open') { return ticket; }
  });
  
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

  // Prioritizing the tickets
  var priorities = []; // PRIORITIES!

  priorities.push(
    { priority: 'Low', 
      count: 0
    },
    { priority: 'Medium', 
      count: 0
    },
    { priority: 'High', 
      count: 0}
    );

  var getCount = function (data, priorityInt) {
    return data.tickets.filter( function(t,index,arr) {
      if ( t.priority === priorityInt ){ return 1; }
    }).length;
  };

  var priorityCount = function(d, lowCount, medCount, highCount){
    priorities.forEach(function(p){
      if (p.priority === 'Low'){
        p.count = getCount(d, 3);
      } else if (p.priority === 'Medium'){
        p.count = getCount(d, 2);
      } else if (p.priority === 'High'){
        p.count = getCount(d, 1);
      } else {
        console.error('No priority noted for ticket ' + d);
      }
    });
  };

  console.log(priorities);
  
  // ...and here
  var stackData = priorities.map(function (d){
    return d.data.map(function (t, i){
      return {
        y: t.count,
        x: t.assId
      };
    });
  });

  var priorityLevels = priorities.map(function (t){
    return t.priority;
  });

  ///////////////////////////////////////////////////////////////////////////////
  // GRAPH MAKING
  var width = 600,
      height = 500;


  var stack = d3.layout.stack();

  stack(stackData);

  stackData = stackData.map(function (group) {
    return group.map(function (d) {
      // Invert the x and y values, and y0 becomes x0
      return {
        x: d.y,
        y: d.x,
        x0: d.y0
      };
    });
  });

  //Set up scales
  var xMax = d3.max(stackData, function (group) {
      return d3.max(group, function (d) {
        return d.x + d.x0;
      });
  });

  var xScale = d3.scale.linear()
          .domain([0, xMax])
          .range([0, width]);

  // todo: programatically get names into an array
  var names = [29, 3, 2];        
  // var names = ['Alice', 'Bob', 'Carol'];        


  // todo: implement this to get the names and stuff:
  // card.services('environment').request('user', 2).then(function(data){console.log(data.first_name)})


  var yScale = d3.scale.ordinal()
          .domain(names)
          .rangeRoundBands([0, height], 0.1);
          
  var colors = d3.scale.category10();

  var canvas = d3.select('.jumbotron')
                  .append('svg')
                  .attr('width', width + 60)
                  .attr('height', height)
                  .append('g') //group the rects on the canvas
                  .attr('transform', 'translate(20, 0)');

  // Add a group for each row of data
  var groups = canvas.selectAll('g')
                  .data(stackData)
                  .enter()
                  .append('g')
                  .style('fill', function(d, i) {
                    return colors(i);
                  });

  var rects = groups.selectAll('rect')
          .data(function(d) { return d; })
          .enter()
          .append('rect')
          .attr('x', function(d) {
                  return xScale(d.x0);
          })
          .attr('y', function(d) {
                  return yScale(d.y);
          })
          .attr('height', function (d) {
            return yScale.rangeBand();
          })
          .attr('width', function(d) {
                  return xScale(d.x); 
          })
          .on('mouseover', function (d) {
            var xPos = parseFloat(d3.select(this).attr('x')) + width;
            var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand();
            console.log(xPos);
            console.log(yPos);
            d3.select('#d3-tooltip')
                .style('left', (xPos - (width / 2)) + 'px')
                .style('top', yPos + 'px')
                .select('#value')
                .text(d.x);
            d3.select('#d3-tooltip').classed('hidden', false);
        })
        .on('mouseout', function () {
          d3.select('#d3-tooltip').classed('hidden', true);
        });

  // Axis, no Allies
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(stackData[0].length)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');  

  canvas.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - 17) + ')')
      .call(xAxis);

  canvas.append('g')
      .attr('class', 'axis')
      .call(yAxis); 
});

// get unassigned tickets
// then use return value to fill priority counts
// then use return counts to chart
// bar charts of unassigned tickets, stacked based on time open


/* global d3:true */
/* global RSVP:true */
/* global SW:true */
'use strict';

///////////////////////////////////////////////////////////////////////////////
// START TICKET FILTERING
var assigneeIds     = [],
    dataArray       = [], // this will be passed to D3
    ticketsToChart  = [];

// var callSW = function(){
//   var promise = new RSVP.Promise(function(resolve, reject){
//     var card = new SW.Card();
//     var helpdesk = card.services('helpdesk');
//     helpdesk.request('tickets')
//       .then(function(data) {
//         if (data.tickets.length > 0){
//           resolve(data.tickets);
//         } else {
//           reject('err');
//         }
//       });
//     });
//   return promise;
// };

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

var ticketData  = [],
    lowCount     = 0,
    medCount     = 0,
    highCount    = 0,
    counts       = [];

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

var studyTheTickets = function(unassignedTickets){
  var promise = new RSVP.Promise(function(resolve, reject){  
    unassignedTickets.forEach(function(t){
      ticketData.push(getTicketData(t));
    });
    if (ticketData){
      resolve(ticketData);
    } else {
      reject('errrrrrr');
    }
  });
  return promise;
};

var countTickets = function(ticketData){
  var promise = new RSVP.Promise(function(resolve, reject){
    ticketData.forEach(function(t){
      if (t.priority === 1){
        highCount += 1;
      } else if (t.priority === 2){
        medCount += 1;
      } else if (t.priority === 3){
        lowCount += 1;
      } else {
        console.log('No priority found.');
      }
    });
    counts.push(highCount);
    counts.push(medCount);
    counts.push(lowCount);
    if (counts.length > 0){
      console.log(counts);
      resolve(counts);
    } else {
      reject('err');
    }
  });
  return promise;
};

///////////////////////////////////////////////////////////////////////////////
// GRAPH MAKING
var graphMaker = function(){
  //Width and height
  var width = 500;
  var height = 100;
  var barPadding = 10;

  var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
          11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

  //Create SVG element
  var svg = d3.select(".jumbotron")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  svg.selectAll("rect")
     .data(counts)
     .enter()
     .append("rect")
     .attr("x", function(d, i) {
        return i * (width / counts.length);
     })
     .attr("y", function(d) {
        return height - (d * 20);
     })
     .attr("width", width / counts.length - barPadding)
     .attr("height", function(d) {
        return d * 20;
     })
     .attr("fill", function(d, i) {
      console.log(1 - (i * 0.4));
      return "rgba(255, 102, 0, " + (1 - (i * 0.4)) + ")";
     })
     .on('mouseover', function (d) {
       var xPos = parseFloat(d3.select(this).attr('x'));
       var yPos = parseFloat(d3.select(this).attr('y'));
       d3.select('#d3-tooltip')
           .style('left', (xPos + (width * 1.5)) + 'px')
           .style('top', (yPos + (height)) + 'px')
           .select('#value')
           .text(d);
       d3.select('#d3-tooltip').classed('hidden', false);
     })
     .on('mouseout', function () {
       d3.select('#d3-tooltip').classed('hidden', true);
     });

  svg.selectAll("text")
     .data(counts)
     .enter()
     .append("text")
     .text(function(d) {
        return d;
     })
     .attr("text-anchor", "middle")
     .attr("x", function(d, i) {
        return i * (width / counts.length) + (width / counts.length - barPadding) / 2;
     })
     .attr("y", function(d) {
        return height - (d * 20) + 14;
     })
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("fill", "white");
};


// use function(d,i){ // use i to change the fill/`a` in rgba value color }

// getOpenTickets()
//   .then(getUnassigned)
//   .then(studyTheTickets)
//   .then(countTickets)
//   .then(graphMaker);

counts = [4,1,5];
graphMaker();

// get unassigned tickets
// then use return value to fill priority counts
// then use return counts to chart
// bar charts of unassigned tickets, stacked based on time open


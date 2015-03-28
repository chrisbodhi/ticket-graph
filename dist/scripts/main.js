/* global d3:true */
/* global RSVP:true */
/* global SW:true */
'use strict';

var ticketData  = [],
    counts      = [],
    lowCount    = 0,
    medCount    = 0,
    highCount   = 0;

///////////////////////////////////////////////////////////////////////////////
// START TICKET FILTERING
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
        console.error('No priority found.');
      }
    });
    counts.push(highCount);
    counts.push(medCount);
    counts.push(lowCount);
    if (counts.length > 0){
      resolve(counts);
    } else {
      reject('err');
    }
  });
  return promise;
};

var addLabel = function(i){
  var priorities = {0: 'High', 1: 'Medium', 2: 'Low'};
  return priorities[i];
};

///////////////////////////////////////////////////////////////////////////////
// GRAPH MAKING
var graphMaker = function(){
  //Width and height
  var width = 500;
  var height = 100;
  var barPadding = 10;

  //Create SVG element
  var svg = d3.select('.jumbotron')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

  svg.selectAll('rect')
     .data(counts)
     .enter()
     .append('rect')
     .attr('x', function(d, i) {
        return i * (width / counts.length);
     })
     .attr('y', function(d) {
        return height - (d * 20);
     })
     .attr('width', width / counts.length - barPadding)
     .attr('height', function(d) {
        return d * 20;
     })
     .attr('fill', function(d, i) {
      return 'rgba(255, 102, 0, ' + (1 - (i * 0.4)) + ')';
     })
     .on('mouseover', function (d, i) {
       var xPos = parseFloat(d3.select(this).attr('x'));
       var yPos = parseFloat(d3.select(this).attr('y'));
       d3.select('#d3-tooltip')
           .style('left', (xPos + (width / counts.length - barPadding)) + 'px')
           .style('top', ((yPos + height) + 'px'))
           .select('#value')
           .text(function() {
              return addLabel(i) + ': ' + d;
            });
       d3.select('#d3-tooltip').classed('hidden', false);
     })
     .on('mouseout', function () {
       d3.select('#d3-tooltip').classed('hidden', true);
     });

  svg.selectAll('text')
     .data(counts)
     .enter()
     .append('text')
     .text(function(d) {
        return d;
     })
     .attr('text-anchor', 'middle')
     .attr('x', function(d, i) {
        return i * (width / counts.length) + (width / counts.length - barPadding) / 2;
     })
     .attr('y', function(d) {
        return height - (d * 20) + 14;
     })
     .attr('font-family', 'sans-serif')
     .attr('font-size', '13px')
     .attr('fill', 'white');
};

getOpenTickets()
  .then(getUnassigned)
  .then(studyTheTickets)
  .then(countTickets)
  .then(graphMaker);

// For testing
// counts = [4,1,5];
// graphMaker();

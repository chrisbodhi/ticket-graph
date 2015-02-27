/* global d3:true */  
'use strict';

// Set chart dimensions, radius of chart based on smaller of two dimensions
var width = 360,
    height = 360,
    radius = Math.min(width, height) / 2,
    donutWidth = 75;

// Set legend variables
var legendRectSize = 18,
    legendSpacing = 4;

// Set color scale from D3
var color = d3.scale.category20b();
// Alternative: Set our own color scale
// var color = d3.scale.ordinal()
//               .range(['#hex1'..'#hex5']);

var svg = d3.select('#chart') // get DOM element with chart ID
            .append('svg')    // add an SVG to its end
            .attr('width', width) // set width...
            .attr('height', height) // ...and height
            .append('g') // append a 'g' element to the SVG and then center it
            .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

// to define the chart's outer radius
var arc = d3.svg
            .arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

// starting and ending angles of the segments - function to be called later
// return d.count to get the number from the dataset object
// disable sorting to prevent unintended consequences in the animation
var pie = d3.layout.pie()
            .value(function (d) { return d.count; })
            .sort(null);

// var tooltip = d3.select('#chart')
//                 .append('div')
//                 .attr('class', 'd3-tooltip');

// tooltip.append('div')
//        .attr('class', 'label');

// tooltip.append('div')
//        .attr('class', 'count');

// tooltip.append('div')
//        .attr('class', 'percent');

// $.get(url).then(function(dataset){
//   $.each(dataset, function(i, d){
//     if (d.assignee){
//       console.log(d.assignee.id);
//     }
//   });
// });

// load data from a CSV file
// var url = 'https://gist.githubusercontent.com/chrisbodhi/1670837485e27e6ec5d7/raw/7c4ab29f18f66ab7a7dd35e2958beba84849bbf3/parkingData.csv';
var url = 'scripts/tickets.json'; // ticket info
/*
d3.json(url, function(error, data){
  // set d.count to total number of tickets per user
  // set d.label to ticket.assignee.first_name
});
*/

d3.json(url, function(error, dataset){
  dataset.forEach(function(d){
    // d.count = +d.count;
    // d.enabled = true;
    if (d.assignee){
      console.log(d.assignee);
      // d.users = +d.ticket.assignee.id;
      // d.count = d.
    }
  });

var assignedTix = {};
var determineAssignments = function(ticket){
  'use strict';
  if (assignedTix[ticket.assignee.id]){
    assignedTix[ticket.assignee.id] += 1;
  } else if (assignedTix) {
    assignedTix[ticket.assignee.id] = 1;
  } else {
    unassignedTix.concat(ticket.id);
  }
};


  // create the chart
  var path = svg.selectAll('path') // select all 'path' in g in the svg, but they don't exist yet
                .data(pie(dataset)) // associate dataset with path elements
                .enter() // creates a placeholder node for each dataset value
                .append('path') // replace placeholder with 'path' element
                .attr('d', arc) // define a d attribute for each path element
                .attr('fill', function(d, i){ // use the colorscale to fill each path
                  return color(d.data.label);
                })
                .each(function(d){ this._current = d; });

  // mouse event handlers for the tooltips
  // path.on('mouseover', function(d){
  //   var total = d3.sum(dataset.map(function(d){
  //     return (d.enabled) ? d.count : 0;
  //   }));
    // var percent = Math.round(1000 * d.data.count / total) / 10;
    // tooltip.select('.label').html(d.data.label);
    // tooltip.select('.count').html(d.data.count);
    // tooltip.select('.percent').html(percent + '%');
    // tooltip.style('display', 'block');
  // });
  
  // path.on('mouseout', function(d){
  //   tooltip.style('display', 'none');
  // });

  // path.on('mousemove', function(d){
  //   tooltip.style('top', (d3.event.pageY + 10) + 'px')
  //          .style('left', (d3.event.pageX + 10) + 'px');
  // });

  // define and add the legend for the chart
  // var legend = svg.selectAll('.legend') // select elements with legend class, but they don't exist yet
  //                 .data(color.domain()) // call data with arrays of labels from the dataset
  //                 .enter() // creates the placeholders
  //                 .append('g') // replace placeholders with the g elements
  //                 .attr('class', 'legend') // give each g element the legend class
  //                 .attr('transform', function(d, i){ // centers the legend
  //                   var height = legendRectSize + legendSpacing,
  //                       offset = height * color.domain().length / 2,
  //                       horz = -2 * legendRectSize, // shifts left of center
  //                       vert = i * height - offset;
  //                   return 'translate(' + horz + ',' + vert + ')';
  //                 });

  // // Add the square and label for the legend
  // legend.append('rect')
  //       .attr('width', legendRectSize)
  //       .attr('height', legendRectSize)
  //       .style('fill', color) // color('Abulia') returns '#393b79'
  //       .style('stroke', color)
  //       .on('click', function(label) {
  //         var rect = d3.select(this);
  //         var enabled = true;
  //         var totalEnabled = d3.sum(dataset.map(function(d) {
  //           return (d.enabled) ? 1 : 0;
  //         }));
          
  //         if (rect.attr('class') === 'disabled') {
  //           rect.attr('class', '');
  //         } else {
  //           if (totalEnabled < 2) {return;}
  //           rect.attr('class', 'disabled');
  //           enabled = false;
  //         }

  //         pie.value(function(d) {
  //           if (d.label === label) {d.enabled = enabled;}
  //           return (d.enabled) ? d.count : 0;
  //         });

  //         path = path.data(pie(dataset));

  //         path.transition()
  //           .duration(750)
  //           .attrTween('d', function(d) {
  //             var interpolate = d3.interpolate(this._current, d);
  //             this._current = interpolate(0);
  //             return function(t) {
  //               return arc(interpolate(t));
  //             };
  //           });
  //       });

  // // Add the text to the legend
  // legend.append('text')
  //       .attr('x', legendRectSize + legendSpacing)
  //       .attr('y', legendRectSize - legendSpacing)
  //       .text(function(d) { return d; });

});
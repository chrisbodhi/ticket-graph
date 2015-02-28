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

var tooltip = d3.select('#chart')
                .append('div')
                .attr('class', 'd3-tooltip');

tooltip.append('div')
       .attr('class', 'label');

tooltip.append('div')
       .attr('class', 'count');

tooltip.append('div')
       .attr('class', 'percent');


// ticket info
var url = 'scripts/tickets.json'; 


// todo: for labels, after determineAssignments, get assignee name using 
// card.services('environment').request('users')
//   .then(function(data){
//     data.users.forEach(function(u){
//       console.log(u.first_name)
//     })
//   });


d3.json(url, function(error, dataset){
  var pieData = [],
      unassignedTix = [],
      counts = {};

  var ids = dataset.map(function(d){
    if (d.assignee){
      return d.assignee.id;
    } else {
      unassignedTix = unassignedTix.concat(d);
    }
  });

  ids.sort();
  ids.forEach(function(x) { counts[x] = (counts[x] || 0 ) + 1; });

  Object.keys(counts).forEach(function(c){
    pieData = pieData.concat({label: c, count: counts[c]});
  });

  // create the chart
  var path = svg.selectAll('path') // select all 'path' in g in the svg, but they don't exist yet
                .data(pie(pieData)) // associate dataset with path elements
                .enter() // creates a placeholder node for each dataset value
                .append('path') // replace placeholder with 'path' element
                .attr('d', arc) // define a d attribute for each path element
                .attr('fill', function(d, i){ // use the colorscale to fill each path
                  return color(d.data.label);
                })
                .each(function(d){ this._current = d; });

  // // mouse event handlers for the tooltips
  // path.on('mouseover', function(d){
  //   var total = d3.sum(pieData.map(function(d){
  //     return (d.enabled) ? d.count : 0;
  //   }));
  //   var percent = Math.round(1000 * d.data.count / total) / 10;
  //   tooltip.select('.label').html(d.data.label);
  //   tooltip.select('.count').html(d.data.count);
  //   tooltip.select('.percent').html(percent + '%');
  //   tooltip.style('display', 'block');
  // });
  
  // path.on('mouseout', function(d){
  //   tooltip.style('display', 'none');
  // });

  // path.on('mousemove', function(d){
  //   tooltip.style('top', (d3.event.pageY + 10) + 'px')
  //          .style('left', (d3.event.pageX + 10) + 'px');
  // });

  // define and add the legend for the chart
  var legend = svg.selectAll('.legend') // select elements with legend class, but they don't exist yet
                  .data(color.domain()) // call data with arrays of labels from the dataset
                  .enter() // creates the placeholders
                  .append('g') // replace placeholders with the g elements
                  .attr('class', 'legend') // give each g element the legend class
                  .attr('transform', function(d, i){ // centers the legend
                    var height = legendRectSize + legendSpacing,
                        offset = height * color.domain().length / 2,
                        horz = -2 * legendRectSize, // shifts left of center
                        vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                  });

  // Add the square and label for the legend
  legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color) // color('Abulia') returns '#393b79'
        .style('stroke', color)
        .on('click', function(label) {
          var rect = d3.select(this);
          var enabled = true;
          var totalEnabled = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? 1 : 0;
          }));
          
          if (rect.attr('class') === 'disabled') {
            rect.attr('class', '');
          } else {
            if (totalEnabled < 2) {return;}
            rect.attr('class', 'disabled');
            enabled = false;
          }

          pie.value(function(d) {
            if (d.label === label) {d.enabled = enabled;}
            return (d.enabled) ? d.count : 0;
          });

          path = path.data(pie(dataset));

          path.transition()
            .duration(750)
            .attrTween('d', function(d) {
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function(t) {
                return arc(interpolate(t));
              };
            });
        });

  // Add the text to the legend
  legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });

});
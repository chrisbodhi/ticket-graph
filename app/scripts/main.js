/* global d3:true */  
'use strict';

var dataset = [
  { label: 'Abulia', count: 10 }, 
  { label: 'Betelgeuse', count: 20 },
  { label: 'Cantaloupe', count: 30 },
  { label: 'Dijkstra', count: 40 }
];

// Set chart dimensions, radius of chart based on smaller of two dimensions
var width = 360,
    height = 360,
    radius = Math.min(width, height) / 2,
    donutWidth = radius / 2.4;

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

// create the chart
var path = svg.selectAll('path') // select all 'path' in g in the svg, but they don't exist yet
              .data(pie(dataset)) // associate dataset with path elements
              .enter() // creates a placeholder node for each dataset value
              .append('path') // replace placeholder with 'path' element
              .attr('d', arc) // define a d attribute for each path element
              .attr('fill', function(d, i){ // use the colorscale to fill each path
                console.log(d); // 
                console.log(i); // index of current entry
                console.log(color);
                return color(d.data.label);
              });

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
      .style('stroke', color);

// Add the text to the legend
legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d; });
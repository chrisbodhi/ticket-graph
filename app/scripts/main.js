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

// create the chart:
// 
var path = svg.selectAll('path') // select all 'path' in g in the svg, but they don't exist yet
              .data(pie(dataset)) // associate dataset with path elements
              .enter() // creates a placeholder node for each dataset value
              .append('path') // replace placeholder with 'path' element
              .attr('d', arc) // define a d attribute for each path element
              .attr('fill', function(d, i){ // use the colorscale to fill each path
                console.log(i);
                return color(d.data.label);
              });


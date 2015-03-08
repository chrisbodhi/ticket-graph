/* global d3:true */

'use strict';

var dataArray = [20, 40, 50, 400, 125, 3];
var width = 500,
    height = 500;

var widthScale = d3.scale.linear()
                  .domain([0, Math.max.apply(0, dataArray)])
                  .range([0, width]);

var heightScale = (dataArray.length * 100);

var color = d3.scale.linear()
              .domain([0, Math.max.apply(0, dataArray)])
              .range(['navajowhite', 'tomato']);

var axis = d3.svg.axis()
              .ticks(5) // total number of ticks
              .scale(widthScale);

var canvas = d3.select('.jumbotron')
                .append('svg')
                .attr('width', width)
                .attr('height', Math.max(height, heightScale))
                .append('g') //group the rects on the canvas
                .attr('transform', 'translate(20, 0)');

var bars = canvas.selectAll('rect')
                 .data(dataArray)
                 .enter()
                 .append('rect')
                 .attr('width', function (d) { return widthScale(d); })
                 .attr('height', 50)
                 .attr('fill', function (d) { return color(d); })
                 .attr('y', function (d,i) { return i * 100; });

// Rather than making the canvas variable more clunky, separate concerns!
canvas.append('g')
      .attr('transform', 'translate(0, ' + (heightScale - 20) + ')')
      .call(axis);
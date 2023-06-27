import * as d3 from "d3"

const data = [80, 100, 56, 120, 180, 30, 40, 120, 160]

const svgWidth = 500, svgHeight = 400, barPadding = 5
const barWidth = (svgWidth / data.length)

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("svg")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

const chart = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", function(d) {
        return svgHeight - d
    })
    .attr("height", function(d){
        return d
    })
    .attr("width", barWidth - barPadding)
    .attr("transform", function(d, i){
        const translate = [barWidth * i, 0]
        return "translate(" + translate + ")"
    })

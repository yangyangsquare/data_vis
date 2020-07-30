
function scaPlot_func () {
    var margin = {top: 20, right: 100, bottom: 50, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,

        cMap = {"South": 3, "West": 0, "Northeast": 2, "Midwest": 5},

        xValue = function(d) { return d.age;}, // data -> value
        xScale = d3.scaleLog().base(2).range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display

        yValue = function(d) { return d.temperature;}, // data -> value
        yScale = d3.scaleLinear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}; // data -> display

    var svg = d3.select("#scatterPlot").append("svg")
            .attr("id", "scatterPlot_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    d3.csv("data/3_scatterplot.csv", function(d) {
        d.age = +d.age;
        d.temperature = +d.temperature;
        return d;
    }, function(error, data) {
        if (error) throw error;

        xScale.domain([0.03125, 32]);
        yScale.domain([30, 120]);

        // add the X gridlines
        svg.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines(xScale)
            .tickSize(-height)
            .tickFormat("")
        )

        // add the Y gridlines
        svg.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines(yScale)
            .tickSize(-width)
            .tickFormat("")
        )
        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
        svg.append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", height+30)
            .style("text-anchor", "end")
            .text("Ages (Years)");

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale).ticks(20))
        svg.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(90)")
            .attr("x", 2)
            .attr("y", -20)
            .attr("dy", ".71em")
            .style("text-anchor", "start")
            .text("Temperature (F)");

        // draw dots
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color[cMap[d.region]];}) 
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<h4>" + d.state + "</h4><table>"
                    + "<tr><td>Year<td>" + d.year + "</tr></td>"
                    + "<tr><td>Gender<td>" + d.gender + "</tr></td>"
                    + "<tr><td>Age<td>" + d.age + "</tr></td>"
                    + "<tr><td>Temperature<td>" + d.temperature + "</tr></td>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        all_regions = []
        all_color = []
        for (var key in cMap) {
            all_regions.push(key)
            all_color.push(color[cMap[key]])
        }
        // draw legend
        var legend = svg.selectAll(".legend")
            .data(all_regions)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width+10)
            .attr("y", height/2)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d) {return color[cMap[d]]});

        // // draw legend text
        legend.append("text")
            .attr("x", width+30)
            .attr("y", height/2+10)
            // .style("font-size", 16)
            .text(function(d) { return d;})

    });

    // gridlines in x axis function
    function make_x_gridlines(x) {		
        return d3.axisBottom(x)
            .ticks(20)
    }

    // gridlines in y axis function
    function make_y_gridlines(y) {		
        return d3.axisLeft(y)
            .ticks(20)
    }
}

scaPlot_func ();
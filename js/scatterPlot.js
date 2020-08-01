
function scaPlot_func () {
    var margin = {top: 20, right: 200, bottom: 100, left: 100},
        width = 1260 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,

        cMap = {"South": 0, "West": 2, "Northeast": 5, "Midwest": 3},

        xValue = function(d) { return d.age;}, // data -> value
        xScale = d3.scaleLinear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display

        yValue = function(d) { return d.temperature;}, // data -> value
        yScale = d3.scaleLinear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}; // data -> display

    xScale.domain([0, 16]);
    yScale.domain([30, 120]);

    var svg = d3.select("#scatterPlot").append("svg")
            .attr("id", "scatterPlot_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(20);

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
         .call(xAxis)

     svg.append("text")
         .attr("class", "label")
         .attr("x", width)
         .attr("y", height+30)
         .style("text-anchor", "end")
         .text("Age (Years)");

     // y-axis
     svg.append("g")
         .attr("class", "y axis")
         .call(yAxis)

     svg.append("text")
         .attr("class", "label")
         .attr("transform", "rotate(-90)")
         .attr("x", -2)
         .attr("y", -50)
         .attr("dy", ".71em")
         .style("text-anchor", "end")
         .text("Temperature (F)");

    // function dataSwap(datasetGroup) {

    //     eachDataGroup = data.filter(function(d) { return d.region == datasetGroup })
    //     eachDataGroup.sort(function(a, b) { return a.x - b.x });
    //     svg.selectAll(".circleGroups")
    //         .data(eachDataGroup)
    //         .transition()
    //         .delay(function(d, i) { return i*4; })
    //         .attr("transform",function(d) { return "translate(" + xScale(d.age) + "," + yScale(d.temperature) + ")" })
    
    //     svg.selectAll(".circleGroups")
    //         .select("circle")
    //         .transition()
    //         .delay(function(d, i) { return i*1; })
    //         .style("fill", function(d, i) { return color[cMap[d.region]]; })
    
    //     d3.select(".title")
    //         .text("Group " + datasetGroup)
    // }

    d3.csv("data/3_scatterplot.csv", function(d) {
        d.age = +d.age;
        d.temperature = +d.temperature;
        return d;
    }, function(error, data) {
        if (error) throw error;
        window.data = data;
        var groups = d3.set(data.map(function(d) { return d.region})).values();

        // d3.select(".buttons")
        //     .selectAll("button")
        //     .data(groups)
        //     .enter().append("button")
        //     .text(function(d) { return d + " Region"; })
        //     .on("click", function(d) {

        //         dataSwap(d);
        //     })

        // groupOneData = data.filter(function(d) { return d.region == "South" })
        // groupOneData.sort(function(a, b) { return a.x - b.x });
        
        // var circleGroups = svg.selectAll(".circleGroups")
        //     .data(groupOneData)
        // .enter().append("g")
        // .attr("class", "circleGroups")
        //     .attr("transform",function(d) { 
        //         return "translate(" + xScale(d.age) + "," + yScale(d.temperature) + ")" })
        //     .on("mouseenter", function(d) {

        //         d3.select(this)
        //             .append("text")
        //             .attr("dx", 5)
        //             .attr("dy", 10)
        //             .text("(" + d.age + "," + d.temperature + ")")

        //         d3.selectAll("circle")
        //         .style("fill-opacity", .5);

        //         d3.select(this)
        //         .select("circle")
        //         .transition()
        //         .ease(d3.easeElastic)
        //         .attr("r", 2)
        //         .style("fill-opacity", 1);
        //     })
        //     .on("mouseleave", function(d) {

        //         d3.select(this)
        //         .select("text")
        //         .transition()
        //         .style("opacity", 0)
        //         .transition()
        //         .remove();

        //         d3.select(this)
        //         .select("circle")
        //         .transition()
        //         .ease(d3.easeElastic)
        //         .attr("r", 2)

        //         d3.selectAll("circle")
        //         .style("fill-opacity", 1);
        //     })

        // var radiusSize = 5;

        // circleGroups.append("circle")
        //     .attr("r", radiusSize)
        //     .style("fill", function(d, i) { return color[cMap[d.region]]; })
        
        // draw dots
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", function(d){ return d.region })
            .attr("r", 5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("stroke", "black")
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
        
        // annotation
        var arrow_pos = [85, 300],
            angle = 120,
            line_length = 260,
            textbox_length = 580,
            annotation_text = "Younger children (< 2yr) are more susceptible to heat.";
        annotation(svg, arrow_pos, angle, line_length, textbox_length, annotation_text)

        d3.select("#logCheckbox")
            .on("click", function() {
                if(this.checked) {
                    xScale = d3.scaleLog()
                        .base(2).range([0, width])
                        .domain([0.03125, 32]);
                    d3.selectAll(".annotation")
                        .style("opacity", 0)
                } else {
                    xScale = d3.scaleLinear()
                        .range([0, width])
                        .domain([0, 16]);
                    d3.selectAll(".annotation")
                        .style("opacity", 1)
                }
                xAxis.scale(xScale);
                d3.selectAll("g.x.axis")
                    .transition()
                    .duration(100)
                    .call(xAxis);
                
                d3.selectAll("circle")
                    .transition()
                    .delay(400)
                    .duration(600)
                    .attr("cx", function(d) { return xScale(d.age); })
                })
        
        all_regions = []
        for (var key in cMap) {
            all_regions.push(key)
        }
        // draw legend
        var legend = svg.selectAll(".legend")
            .data(all_regions)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width+10)
            .attr("y", 0)
            .attr("width", 13)
            .attr("height", 13)
            .attr("fill", function(d) {return color[cMap[d]]});

        // draw legend text
        legend.append("text")
            .attr("x", width+30)
            .attr("y", 13)
            .text(function(d) { return d;})
        
        legend.on("click", function(type) {
            currentOpacity = d3.selectAll("." + type).style("opacity")
            d3.select(this)
                .style("opacity", currentOpacity == 1 ? 0.5:1);

            d3.selectAll("." + type)
                .style("opacity", currentOpacity == 1 ? 0:1)
                .filter(function(d) { return d.region == type; })
                .style("opacity", currentOpacity == 1 ? 0:1) 
                .style("stroke", "black")
                .style("fill", function(d) { return color[cMap[d.region]] });
        });

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
    svg.append("text")
        .attr("x", 970)
        .attr("y", 115)
        // .style("font", "24px times")
        .style("font-weight", "bold")
        // .style("fill", "black")
        .text("(Try to click the legend.)");
}

scaPlot_func ();
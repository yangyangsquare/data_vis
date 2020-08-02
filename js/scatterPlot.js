
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
        yMap = function(d) { return yScale(yValue(d));}, // data -> display

        annotation_class = "scatter_annotation";

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
        // .attr("class", "scatter_x")
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
     a = svg.append("g")
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

    d3.csv("data/3_scatterplot.csv", function(d) {
        d.age = +d.age;
        d.temperature = +d.temperature;
        return d;
    }, function(error, data) {
        if (error) throw error;
        window.data = data;
        var groups = d3.set(data.map(function(d) { return d.region})).values();
        
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
        var arrow_pos1 = [100, 290],
            arrow_pos2 = [520, 300],
            angle1 = 135,
            angle2 = 60,
            line_length1 = 330,
            line_length2 = 260,
            textbox_length = 580,
            annotation_text = "Younger children (< 2yr) are more susceptible to heat.";
        annotation(svg, arrow_pos1, angle1, line_length1, textbox_length, annotation_text, annotation_class)

        d3.select("#logCheckbox")
            .on("click", function() {
                if(this.checked) {
                    xScale = d3.scaleLog()
                        .base(2).range([0, width])
                        .domain([0.03125, 32]);
                    d3.selectAll("."+annotation_class).remove();
                    annotation(svg, arrow_pos2, angle2, line_length2, textbox_length, annotation_text, annotation_class);
                } else {
                    xScale = d3.scaleLinear()
                        .range([0, width])
                        .domain([0, 16]);
                    d3.selectAll("."+annotation_class).remove();
                    annotation(svg, arrow_pos1, angle1, line_length1, textbox_length, annotation_text, annotation_class);
                }
                xAxis.scale(xScale);
                a.transition()
                    .duration(100)
                    .call(xAxis);
                
                d3.selectAll("circle")
                    .transition()
                    // .delay(400)
                    .duration(500)
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
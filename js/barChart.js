
function barChart_func () {
    var margin = {top: 100, right: 50, bottom: 60, left: 50},
        width = 700 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        y = d3.scaleLinear().rangeRound([height, 0]).nice(),
        x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.05).align(0.1);

    var svg = d3.select("#barChart").append("svg")
            .attr("id", "barChart_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("data/1_year_bar_chart.csv", function(error, raw) {
        if (error) throw error;

        var data_stack = []
        var symbols = []
        var years = []
        // Data pre-processing
        for (var key in raw.data) {
            if (key == "year") { continue; }
            symbols.push(key)
        }
        raw.forEach(function(d, i) {
            var t = {}
            for (var key in d) {
                if (key == "deaths") { continue; }
                t[key] = +d[key]
                if (key == "year") { 
                    years.push(+d[key])
                }
                else if(symbols.indexOf(key) < 0) {
                    symbols.push(key)
                }
            }
            data_stack.push(t)
        });
        
        
        var layers = d3.stack().keys(symbols)(data_stack);

        var max = d3.max(layers[layers.length-1], function(d) { return d[1]; });
        
        y.domain([0, max]);
        x.domain(years);


        svg.append("g").selectAll("g")
            .data(layers)
        .enter().append("g")
            .style("fill", function(d, i) { return color[i]; })	
            .selectAll("rect")
        .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d, i) { return x(d.data.year); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", function(d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<h4>"+ d.data.year +"</h4><table>"  
                + "<tr><td> Deaths: <td>" + (d[1] - d[0]) + "</tr></td>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("y", -5)
            .attr("x", 10)
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
        
        svg.append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", height + 60)
            .style("text-anchor", "end")
            .text("Year");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (0) + ", 0)")
            .call(d3.axisLeft().scale(y))

        svg.append("text")
            .attr("class", "label")
            .attr("x", -50)
            .attr("y", -30)
            .style("text-anchor", "start")
            .attr("transform", "rotate(-90)")
            .text("Deaths");

        // annotation
        var arrow_pos = [530, 60],
            angle = -35,
            line_length = 230,
            textbox_length = 515,
            annotation_text = "The fatality trend is growing in the last 5 years.";
        annotation(svg, arrow_pos, angle, line_length, textbox_length, annotation_text)

    });

}


barChart_func ();



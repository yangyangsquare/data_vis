function pieChart_func () {
    var margin = {top: 20, right: 50, bottom: 20, left: 50},
        width = 850 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2,
        cornerRadius = 3,
        padAngle = 0.025,
        floatFormat = d3.format('.4r'),
        percentFormat = d3.format(',.2%');

    var svg = d3.select("#pieChart").append("svg")
            .attr("id", "pieChart_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // creates a new pie generator
    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return floatFormat(d.Percent); });

    // contructs and arc generator.
    var piearc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(0)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

    // this arc is used for aligning the text labels
    var outerArc = d3.arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);

    d3.csv("data/1_age_pie_chart.csv", function(error, data) {
        if (error) throw error;

        var piechart = svg.append("g")
          .selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc")

        // add and colour the donut slices
        piechart.append('path')
            .attr('fill', function(d, i) {                
                if (i>0) {
                return color[i-1];
            }
            return color[6];})
            .on("mouseover", function(d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<h4>"+ d.data.Age +"</h4><table>"  
                + "<tr><td> Percent: <td>" + percentFormat(d.data.Percent) + "</tr></td>"
                + "<tr><td> Deaths: <td>" + d.data.Deaths + "</tr></td>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d, i) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .attr('d', piearc)


        // add text labels
        piechart.append('text')
            .attr('dy', '.35em')
            .html(function(d) {
                // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                return percentFormat(d.data['Percent']) + '<tspan>';
            })
            .attr('transform', function(d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.9 * (midAngle(d) < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
                // if slice centre is on the left, anchor text to start, otherwise anchor to end
                return (midAngle(d)) < Math.PI ? 'start' : 'end';
            });

        // add lines connecting labels to slice. A polyline creates straight lines connecting several points
        piechart.append('polyline')
            .attr('points', function(d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.9 * (midAngle(d) < Math.PI ? 1 : -1);
                return [piearc.centroid(d), outerArc.centroid(d), pos]
            })
            .style("stroke", "black")    // set the line colour
            .style("fill", "none");

        var legendG = svg.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
            .data(pie(data))
            .enter().append("g")
            .attr("transform", function(d,i){
              return "translate(" + (-width/1.8) + "," + (-30 + i * 20) + ")"; // place each legend on the right and bump each one down 15 pixels
            })
            .attr("class", "legend");   
          
        legendG.append("rect") // make a matching color rect
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d, i) {
                if (i>0) {
                    return color[i-1];
                }
                return color[6];
            });
          
        legendG.append("text") // add the text
            .text(function(d){
              return d.data.Age;
            })
            .attr("font-weight", 16)
            .attr("y", 10)
            .attr("x", 20);

        // calculates the angle for the middle of a slice
        function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

        function toolTipHTML_pie(data) {

        var tip = '',
            i   = 0;

        for (var key in data.data) {

            if (key == 'color') { continue; }

            var value = (!isNaN(parseFloat(data.data[key]))) && (parseFloat(data.data[key])<1) ? percentFormat(data.data[key]) : data.data[key];

            if (i === 0) tip += '<tr><td>' + key + '<td>' + value + '</tr></td>';
            else tip += '<tr><td>' + key + '<td>' + value + '</tr></td>';
            i++;
        }
        return tip;
        }
    });
}

pieChart_func ();
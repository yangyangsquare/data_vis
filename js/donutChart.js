
function donChart_func () {
    var margin = {top: 10, right: 10, bottom: 40, left: 10},
        width = 960 - margin.left - margin.right,
        height = 610 - margin.top - margin.bottom,
        
        // color = d3.scaleOrdinal(d3.schemeCategory10),
        radius = Math.min(width, height) / 2,
        cornerRadius = 3,
        padAngle = 0.035,
        floatFormat = d3.format('.4r'),
        percentFormat = d3.format(',.2%');

    // creates a new pie generator
    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return floatFormat(d.Percent); });

    // contructs and arc generator. This will be used for the donut. The difference between outer and inner
    // radius will dictate the thickness of the donut
    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.6)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

    // this arc is used for aligning the text labels
    var outerArc = d3.arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);

    donut_svg = d3.select("#donutChart").append("svg")
            .attr("id", "donutChart_svg")
            .attr('width', width)
            .attr('height', height)
        .append("g")
        .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

    d3.csv("data/donutChart.csv", function(d) {
        d.Percent = +d.Percent;
        return d;
    }, function(error, data) {
        if (error) throw error;

        var piechart = donut_svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc").call(toolTip_donut);


        // add and colour the donut slices
        piechart.append('path')
            .attr('fill', function(d) { return color[d.data['color']]; })
            .attr('d', arc);

        // add text labels
        piechart.append('text')
            .attr('dy', '.35em')
            .html(function(d) {
                // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                return d.data.Reason + '<tspan x="0" dy="1.2em">' + percentFormat(d.data['Percent']) + '</tspan>';
            })
            .attr('transform', function(d) {
                var pos = outerArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
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
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                return [arc.centroid(d), outerArc.centroid(d), pos]
            })
            .style("stroke", "black")    // set the line colour
            .style("fill", "none");
    });

    // calculates the angle for the middle of a slice
    function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

    // function that creates and adds the tool tip to a selected element
    function toolTip_donut(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (data) {

            donut_svg.append('circle')
            .attr('class', 'toolCircle')
            .attr('r', radius * 0.55) // radius of tooltip circle
            .style('fill', color[data.data['color']]) // colour based on category mouse is over
            .style('fill-opacity', 0.35);

            donut_svg.append('text')
            .attr('class', 'toolCircle')
            .attr('dy', "-3.2em") // hard-coded. can adjust this to adjust text vertical alignment in tooltip
            .html(toolTipHTML_donut(data)) // add text to the circle.
            .style('font-size', '1em')
            .style('text-anchor', 'left'); // centres text in tooltip

        });

        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
        });
    }

    // function to create the HTML string for the tool tip. Loops through each key in data object
    // and returns the html string key: value
    function toolTipHTML_donut(data) {

        var tip = '',
            i   = 0;

        for (var key in data.data) {

            if (key == 'color') { continue; }

            // if value is a number, format it as a percentage
            var value = (!isNaN(parseFloat(data.data[key]))) && (parseFloat(data.data[key])<1) ? percentFormat(data.data[key]) : data.data[key];

            // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
            // tspan effectively imitates a line break.
            if (i === 0) tip += '<tspan x="-6.8em">' + value + '</tspan>';
            else tip += '<tspan x="-6.8em" dy="1.2em">' + key + ': ' + value + '</tspan>';
            i++;
        }

        return tip;
    }
}

donChart_func ();
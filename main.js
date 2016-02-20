var DN = {};
//Define Global vars within Object 'Namespace'
DN.clickedHood = null;
DN.ttipConst = {x: 5, y: -30};
DN.scale = {};
DN.scale.stopLight = d3.scale.linear()
    .domain([0, 20, 35])
    .range(["#b3cde3", "#8c96c6", "#8856a7"]);
DN.mapDiv = "#svgMap";
DN.clickColor = '#810f7c';
DN.hoverColor = '#810f7c';

DN.init = function () {
    d3.json("annotatedData.geojson", function (error, data) {
        if (error) throw error;

        DN.tooltip = d3.select("body").append("div").attr("class", "ttip");
        DN.mapProjection = d3.geo.mercator()
            .scale(147238.56343084128)
            .center([-77.0144701798118, 38.89920210515231]) //projection center
            .translate([$(DN.mapDiv).width() / 2,
                $(DN.mapDiv).height() / 2]); //translate to center the map in view

        DN.path = d3.geo.path()
            .projection(DN.mapProjection);

        var map = d3.select(DN.mapDiv);
        map.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", DN.path)
            .attr("fill", function (obj, index) {
                return DN.scale.stopLight(obj.properties.total);
            })
            .attr("stroke", "white")
            .attr("stroke-width", "2")
            .on("click", DN.hoodClick)
            .on("mouseover", DN.hoodOver)
            .on("mousemove", DN.mouseMove)
            .on("mouseout", DN.clearTip);

        DN.createInitialGraph();
    });


};


DN.hoodClick = function (obj, index) {
    // console.log("clicked",obj,index);
    if (!DN.clickedHood && !this.setAttribute) {

    } else if (!DN.clickedHood && this.setAttribute) {
        d3.select(this).attr("fill", DN.clickColor);
        DN.clickedHood = this;
    } else {
        d3.select(DN.clickedHood).attr("fill", function (obj, index) {
            return DN.scale.stopLight(obj.properties.total);
        });
        DN.clickedHood = null;
        d3.select(this).attr("fill", DN.clickColor);
        DN.clickedHood = this;
    }


    function createDisplayHTML(properties) {
        var obj = [{Year: 2010, Crashes: properties["2010"]},
            {Year: 2011, Crashes: properties["2011"]},
            {Year: 2012, Crashes: properties["2012"]},
            {Year: 2013, Crashes: properties["2013"]},
            {Year: 2014, Crashes: properties["2014"]}];
        return obj;
    }


    d3.select('.cPanel').html("");
    d3.select('#chartLabel').html('<div class="chart-label">' + obj.properties.name + '</div>');
    if (obj.properties.total > 0) {
        var svg = dimple.newSvg(".cPanel", 450, 450);


        var bardata = createDisplayHTML(obj.properties);
        var chart = new dimple.chart(svg, bardata);

        chart.addCategoryAxis("x", "Year");
        var y = chart.addMeasureAxis("y", "Crashes");
        y.overrideMin = 0;
        y.overrideMax = 12;
        chart.addSeries("Accidents", dimple.plot.bar);
        chart.ease = "easeIn";
        chart.assignColor("Accidents", "#b3cde3", "#669ac7", 1);
        chart.defaultColors = [
            new dimple.color("red"),
            new dimple.color("yellow"),
            new dimple.color("green"),
            new dimple.color("blue"),
            new dimple.color("purple")
        ];
        chart.draw(500);

    } else {
        var panel = d3.select('.cPanel');
        panel.style('width', '450px');
        panel.style('height', '450px');
        panel.style('margin-top', '15px');
        panel.html("No Impaired Accidents Reported from 2010-2014");
    }

};


DN.createInitialGraph = function () {

    var totalsObj = [{Year: 2010, Crashes: 139},
        {Year: 2011, Crashes: 170},
        {Year: 2012, Crashes: 170},
        {Year: 2013, Crashes: 172},
        {Year: 2014, Crashes: 202}];


    d3.select('.cPanel').html("");
    d3.select('#chartLabel').html('<div class="chart-label">DC Citywide</div>');

    var svg = dimple.newSvg(".cPanel", 450, 450);
    var chart = new dimple.chart(svg, totalsObj);
    chart.addCategoryAxis("x", "Year");
    var y = chart.addMeasureAxis("y", "Crashes");
    y.overrideMin = 0;
    y.overrideMax = 250;
    chart.addSeries("Accidents", dimple.plot.bar);
    chart.ease = "easeIn";
    chart.assignColor("Accidents", "#b3cde3", "#669ac7", 1);
    chart.draw(500);
};

DN.clearTip = function () {
    DN.tooltip.style("display", "none");
    if (DN.clickedHood != this) {
        d3.select(this).attr("fill", function (obj, index) {
            return DN.scale.stopLight(obj.properties.total);
        })
    }
};

DN.mouseMove = function () {
    DN.tooltip.style("top", (d3.event.pageY + DN.ttipConst.y) + "px")
        .style("left", (d3.event.pageX + DN.ttipConst.x) + "px");
};

DN.hoodOver = function (obj, index) {
//    console.log("move over object",obj.properties.name);
    DN.tooltip.style("display", "block")
        .html("<div class='align:center'>" + obj.properties.name + "</div><div>Total Accidents: " + (obj.properties.total ? obj.properties.total : "0") + "</div>");
    if (DN.clickedHood != this) {
        d3.select(this).attr("fill", DN.hoverColor);
    }
};

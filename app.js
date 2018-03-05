// Responsive
d3.select(window).on("resize", resize);

function resize() {
  var svgArea = d3.select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
    renderScatter();
  }
}

// Render chart
renderScatter();

function renderScatter() {
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = { top: 20, right: 40, bottom: 85, left: 100 };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var chart = svg.append("g");

  // Append a div to the body to create tooltips, assign it a class
  d3.select(".chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.csv("data/data.csv", function(err, healthData) {
    if (err) throw err;

    healthData.forEach(function(data) {
      data.lessHS = +data.lessHS;
      data.hs = +data.hs;
      data.bach = +data.bach;
      data.cantAffordDr = +data.cantAffordDr;
      data.bingeDrinkers = +data.bingeDrinkers;
      data.disabled = +data.disabled;
    });

    // Step 1: Create scale functions
    //= =============================

    // Set the range, and declare x
    var yLinearScale = d3.scaleLinear().range([height, 0]);
    var xLinearScale = d3.scaleLinear().range([0, width]);

    // Step 2: Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 3: Scale the domain for each new correlation
    //= =======================
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    function xMinMax(dataColumnX) {
      xMin = d3.min(healthData, function(data) {
        return +data[dataColumnX];
      });
      xMax = d3.max(healthData, function(data) {
        return +data[dataColumnX];
      });
    }
    function yMinMax(dataColumnY) {
      yMin = d3.min(healthData, function(data) {
        return +data[dataColumnY];
      });
      yMax = d3.max(healthData, function(data) {
        return +data[dataColumnY];
      });
    }

    // Default axes
    var currentX = "lessHS";
    var currentY = "cantAffordDr";

    // New axes
    xMinMax(currentX);
    yMinMax(currentY);

    // Set domains
    xLinearScale.domain([xMin - 2, xMax + 2]);
    yLinearScale.domain([0, yMax + 5]);

    // Step 4: Initialize tooltips
    //= ==========================
    var toolTip = d3
      .tip()
      .attr("class", "tooltip")
      .offset([-3, 0])
      .html(function(data) {
        var stateInfo = data.fullState + " (" + data.state + ")";
        var edInfo = +data[currentX];
        var healthInfo = +data[currentY];
        var edString;
        var healthString;
        // Change col based on var clicked
        if (currentX === "lessHS") {
          edString = "No HS diploma: ";
        }
        else if (currentX === "hs") {
          edString = "HS grads: ";
        }
        else {
          edString = "Bach. or above: ";
        }
        if (currentY === "cantAffordDr") {
          healthString = "Can't afford doctor: ";
        }
        else if (currentY === "bingeDrinkers") {
          healthString = "Binge drinkers: ";
        }
        else {
          healthString = "Disabled: ";
        }
        // Return complete tooltip
        return "<b><u>" + stateInfo + "</u></b><br>" + healthString + healthInfo + "%<br>" + edString + edInfo + "%";
      });

    // Step 5: call toolTip (this has been done for you)
    //= ===============================================
    chart.call(toolTip);

    chart.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", function(data, index) {
          return xLinearScale(+data[currentX]);
        })
        .attr("cy", function(data, index) {
          return yLinearScale(+data[currentY]);
        })
        .attr("r", "11")
        .attr("fill", "lightsteelblue")
        .attr("stroke", "whitesmoke")
        // Step 6: Use the event listener to create onclick and onmouseout events
        //= =====================================================================
        .on("click", function(data) {
          toolTip.show(data);
        })
        .on("mouseout", function(data) {
          toolTip.hide(data);
          d3.select(this).style("fill", "lightsteelblue");
        })
        .on("mouseover", function(data) {
          d3.select(this).style("fill", "slategray");
        });

    chart.selectAll(null)
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", function(data, index) {
          return xLinearScale(+data[currentX]);
        })
        .attr("y", function(data, index) {
          return yLinearScale(+data[currentY]) + 3.5;
        })
        .attr("text-anchor", "middle")
        .text(function(data){
            return data.state;
        })
        .attr("class", "circleLabel")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("fill", "white");


    chart.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "xAxis")
      .call(bottomAxis);

    chart.append("g")
      .attr("class", "yAxis")
      .call(leftAxis);

    // y labels
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText active yLabel")
        .attr("data-axis-name", "cantAffordDr")
        .text("Can't afford needed doctor's visit (%)");
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText inactive yLabel")
        .attr("data-axis-name", "bingeDrinkers")
        .text("Binge drinkers (%)");
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText inactive yLabel")
        .attr("data-axis-name", "disabled")
        .text("Disabled (%)");

    // Append xAxis labels
    chart.append("text")
      .attr("transform",
            "translate(" + (width / 2) + " ," +
                           (height + margin.top + 20) + ")")
      .attr("class", "axisText active xLabel")
      .attr("data-axis-name", "lessHS")
      .text("Less than high school diploma (%)");
    chart.append("text")
      .attr("transform",
            "translate(" + (width / 2) + " ," +
                           (height + margin.top + 40) + ")")
      .attr("class", "axisText inactive xLabel")
      .attr("data-axis-name", "hs")
      .text("High school diploma (%)");
    chart.append("text")
      .attr("data-axis-name", "bach")
      .attr("transform",
            "translate(" + (width / 2) + " ," +
                           (height + margin.top + 60) + ")")
      .attr("class", "axisText inactive xLabel")
      .text("Bachelor's degree (%)");

///////////////////////
// Change w axis clicks
///////////////////////

// X labels

function xlabelChange(clickedXAxis) {
    d3
      .selectAll(".xLabel")
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedXAxis.classed("inactive", false).classed("active", true);
  }

 d3.selectAll(".xLabel").on("click", function() {
    var clickedXSelection = d3.select(this);
    var isClickedXSelectionInactive = clickedXSelection.classed("inactive");
    var clickedXAxis = clickedXSelection.attr("data-axis-name");

    if (isClickedXSelectionInactive) {
      // Assign the clicked axis to the variable currentX
      currentX = clickedXAxis;
      // Call xMinMax() to define the min and max domain values.
      xMinMax(currentX);
      // Set the domain for the xAxis
      xLinearScale.domain([xMin - 2, xMax + 2]);
      // Create a transition effect for the xAxis
      svg
        .select(".xAxis")
        .transition()
        .duration(1000)
        .call(bottomAxis);
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .attr("cx", function(data) {
            return xLinearScale(+data[currentX]);
          })
          .duration(1000);
      });
      d3.selectAll(".circleLabel").each(function() {
        d3
          .select(this)
          .transition()
          .attr("x", function(data) {
            return xLinearScale(+data[currentX]);
          })
          .duration(1000);
      });
      // Change the status of the axes. See above for more info on this function.
      xlabelChange(clickedXSelection);
    }
  });

 // Y axis

function ylabelChange(clickedYAxis) {
    d3
      .selectAll(".yLabel")
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedYAxis.classed("inactive", false).classed("active", true);
  }

 d3.selectAll(".yLabel").on("click", function() {
    var clickedYSelection = d3.select(this);
    var isClickedYSelectionInactive = clickedYSelection.classed("inactive");
    var clickedYAxis = clickedYSelection.attr("data-axis-name");

    if (isClickedYSelectionInactive) {
      // Assign the clicked axis to the variable currentX
      currentY = clickedYAxis;
      // Call xMinMax() to define the min and max domain values.
      yMinMax(currentY);
      // Set the domain for the xAxis
      yLinearScale.domain([0, yMax + 2]);
      // Create a transition effect for the xAxis
      svg
        .select(".yAxis")
        .transition()
        .duration(1000)
        .call(leftAxis);
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .attr("cy", function(data) {
            return yLinearScale(+data[currentY]);
          })
          .duration(1000);
      });
      d3.selectAll(".circleLabel").each(function() {
        d3
          .select(this)
          .transition()
          .attr("y", function(data) {
            return yLinearScale(+data[currentY]) + 3.5;
          })
          .duration(1000);
      });
      ylabelChange(clickedYSelection);
    }
  });

///////////////////
  });
}


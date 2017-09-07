/**
 * Created by user on 4/10/15.
 */
'use strict';

angular.module('ChartInitService', [])
  .factory('ChartInit',

  function($window, $filter, Debounce, DataProcessing) {

    // ***************** Make Data **************** //
    function randValue() {
      return (Math.floor(Math.random() * 30));
    }
    function weeksformatter(val, axis) {
      switch (true) {
        case val == 1:
          return 'MON';
          break;
        case val == 2:
          return 'SUN';
          break;
        case val == 3:
          return 'TUE';
          break;
        case val == 4:
          return 'WED';
          break;
        case val == 5:
          return 'THU';
          break;
        case val == 6:
          return 'FRI';
          break;
        case val == 7:
          return 'SAT';
          break;
        default:
          return 1;
          break;
      }
    }

    function showTooltip(x, y, content) {
      var cssParams = {
          position: 'absolute',
          display: 'none',
          border: '1px solid #333',
          padding: '4px',
          color: '#fff',
          'border-radius': '3px',
          'background-color': '#333',
          opacity: 0.8
        },windowWidth = $(document).width(),
        windowHeight = $(document).height();
      if (x < 0.8 * windowWidth) {
        cssParams.left = x + 3;
      }else{
        cssParams.right = windowWidth - x + 6;
      }
      if (y < 0.8 * windowHeight) {
        cssParams.top = y + 3;
      } else {
        cssParams.bottom = windowHeight - y + 6;
      }
      $('<div id="tooltip">' + content + '</div>').css(cssParams).appendTo('body').fadeIn(100);
    }

    var makeData = function(type) {
      var data = {};
      data.good = [
        [1426896000000, randValue()],
        [1427068800000, 22],
        [1427328000000, 50],
        [1427500800000, 90],
        [1427587200000, 120],
        [1427673600000, 70],
        [1427846400000, 220]
      ];
      data.goodTime = [
        [1426809600000, randValue()],
        [1426896000000, 22],
        [1426982400000, 50],
        [1427068800000, 90],
        [1427155200000, 120],
        [1427241600000, 70],
        [1427328000000, 220],
        [1427414400000, 160],
        [1427500800000, 120],
        [1427587200000, 70],
        [1427673600000, 220],
        [1427846400000, 120]
      ];
      data.bad = [
        [1426809600000, randValue()],
        [1427068800000, 140],
        [1427414400000, 80],
        [1427500800000, 70],
        [1427587200000, 50],
        [1427673600000, 90],
        [1427846400000, 18]
      ];
      data.double = [
        {
          label: "COUNT",
          data: data.good,
          color: "#FF0000",
          points: { fillColor: "#FF0000", show: true },
          lines: { show: true }
        },
        {
          label: "VOLUME",
          data: data.bad,
          xaxis: 2,
          color: "#0062E3",
          points: { fillColor: "#0062E3", show: true },
          lines: { show: true }
        }
      ];
      return data[type].map(function (item) {
        return [item[0], item[1] + randValue()];
      });
    };

    // ************ Bind once all charts redraw to window resize **************** //

    var redrawAllCharts = function () {
      for (var i = 0; i < debounceArray.length; i++) {
        var debFunction = debounceArray[i];
        debFunction();
      }
    };

    // Array of all debounce functions
    var debounceArray = [];
    (function() {
      angular.element($window).bind("resize", function() {
        redrawAllCharts();
      });
      return false;
    })();

    // ***************** Dotted Line Chart **************** //
    var dottedLineChartInit = function(chartID, chartData, tooltipLabel) {
      if ($('#chart_' + chartID).size() != 1) return;
      var pageviews = chartData,
        chartEl = $("#chart_" + chartID),
        data = [{
          data: pageviews,
          label: tooltipLabel,
          dashes: { show: true },
          lines: {
            // Main line width
            lineWidth: 1
          },
          shadowSize: 1,
          // Main line color
          color: '#fff'
        }],
        options = {
          legend: {
            show: false
          },
          series: {
            lines: {
              show: true,
              lineWidth: 3,
              // Fill underline
              fill: false,
              color: '#fff',
              fillColor: {
                colors: [{
                  opacity: 0.09
                }, {
                  opacity: 0.01
                }]
              }
            },
            points: {
              show: true,
              radius: 6,
              lineWidth: 1,
              fill: true,
              fillColor: "rgba(255, 255, 255, 1)"
            },
            shadowSize: 2
          },
          grid: {
            hoverable: true,
            clickable: true,
            tickColor: "#eee",
            borderColor: "#eee",
            borderWidth: {top: 0, bottom: 0, right: 0, left: 0},
            backgroundColor: "rgba(255, 255, 255, 0)",
            labelMargin: 10
          },
          colors: ["#d12610", "#37b7f3", "#52e136"],
          xaxis: {
            font: {
              size: 13,
              lineHeight: 13,
              family: "'pt-sans', sans-serif",
              color: "#eee"
            },
            mode: "time",
            timeformat: chartData.length === 7 ? "%a" : "%m/%d",
            minTickSize: [1, "day"],
            tickColor: "rgba(255, 255, 255, 0)",
            position: 'top',
            tickSize: 0,
            show: (Metronic.getResponsiveBreakpoint('xs') < Metronic.getViewPort().width) || chartData.length < 5
          },
          yaxis: {
            font: {
              size: 11,
              lineHeight: 13,
              family: "'pt-sans', sans-serif",
              color: "#eee",
              padding: '15px'
            },
            ticks: 7,
            tickDecimals: 0,
            tickColor: "#eee",
            position: 'right'
          }
        };
      $.plot(chartEl, data, options);
      var previousPoint = null;
      $("#chart_" + chartID).bind("plothover", function(event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#tooltip").remove();
            var x = DataProcessing.toDateFormat(item.datapoint[0]),
              y = item.datapoint[1];
            showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
      angular.element($window).bind("resize", function() {
        options.xaxis.show = (Metronic.getResponsiveBreakpoint('xs') < Metronic.getViewPort().width) || chartData.length < 5
        $.plot(chartEl, data, options);
      });

      //var debounce = Debounce(function() {
      //  $.plot(chartEl, data, options);
      //}, 300, false);
      //debounceArray.push(debounce);
      return false;
    };

    var dottedLineChartInitUniversal = function(chartID, chartData, tooltipLabel) {
      if ($('#chart_' + chartID).size() != 1) return;

      var ticks = _.map(chartData, function(cD){
        return [cD[0], cD[2]]
      });
      var pageviews = _.map(chartData, function(cD){ return [cD[0], cD[1]] }),
        chartEl = $("#chart_" + chartID),
        data = [{
          data: pageviews,
          label: tooltipLabel,
          lines: {
            lineWidth: 1
          },
          shadowSize: 1,
          color: '#fff'
        }],
        options = {
          legend: {
            show: false
          },
          series: {
            lines: {
              show: true,
              lineWidth: 5,
              fill: false,
              color: '#fff',
              fillColor: {
                colors: [{
                  opacity: 0.09
                }, {
                  opacity: 0.01
                }]
              }
            },
            points: {
              show: true,
              radius: 8,
              lineWidth: 1,
              fill: true,
              fillColor: "rgba(255, 255, 255, 1)"
            },
            shadowSize: 2
          },
          grid: {
            hoverable: true,
            clickable: true,
            tickColor: "#eee",
            borderColor: "#eee",
            borderWidth: {top: 0, bottom: 0, right: 0, left: 0},
            backgroundColor: "rgba(255, 255, 255, 0)",
            minBorderMargin: 25
          },
          colors: ["#d12610", "#37b7f3", "#52e136"],

          xaxis: {
            font: {
              size: 11,
              lineHeight: 11,
              family: "'pt-sans', sans-serif",
              color: "#eee",
              show: (Metronic.getResponsiveBreakpoint('xs') < Metronic.getViewPort().width) || chartData.length < 5
            },
            position: 'top',
            ticks: ticks,
            mode: "time",
            show:chartData.length < 8
          },
          yaxis: {
            font: {
              size: 11,
              lineHeight: 13,
              family: "'pt-sans', sans-serif",
              color: "#eee",
              padding: '15px'
            },
            ticks: 7,
            tickDecimals: 0,
            tickColor: "#eee",
            position: 'right'
          }
        };
      $.plot(chartEl, data, options);
      var previousPoint = null;
      $("#chart_" + chartID).bind("plothover", function(event, pos, item) {
        $("#x").text(pos.x);
        $("#y").text(pos.y);
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#tooltip").remove();
            var x, y = item.datapoint[1];
            _.each(chartData, function(cD){
              if (cD[0]==item.datapoint[0]) x = cD[2]
            });
            showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
      angular.element($window).bind("resize", function() {
        options.xaxis.show = (Metronic.getResponsiveBreakpoint('xs') < Metronic.getViewPort().width) || chartData.length < 5
        $.plot(chartEl, data, options);
      });

      //var debounce = Debounce(function() {
      //  $.plot(chartEl, data, options);
      //}, 300, false);
      //debounceArray.push(debounce);
      //return false;
    };


    // Double dotted line chart
    var doubleDottedLineChartInit = function(chartID, chartData, tooltipLabel) {
      if ($('#chart_' + chartID).size() != 1) {
        return;
      }
      var pageviews = chartData,
        chartEl = $("#chart_" + chartID),
        data = [{
          data: pageviews,
          label: tooltipLabel,
          lines: {
            // Main line width
            lineWidth: 1,
          },
          shadowSize: 1,
          // Main line color
          color: '#fff'
        }],
        options = {
          legend: {
            show: false
          },
          series: {
            lines: {
              show: true,
              lineWidth: 5,
              // Fill underline
              fill: false,
              color: '#fff',
              fillColor: {
                colors: [{
                  opacity: 0.09
                }, {
                  opacity: 0.01
                }]
              }
            },
            points: {
              show: true,
              radius: 8,
              lineWidth: 1,
              fill: true,
              fillColor: "rgba(255, 255, 255, 1)"
            },
            shadowSize: 2
          },
          grid: {
            hoverable: true,
            clickable: true,
            tickColor: "#eee",
            borderColor: "#eee",
            borderWidth: {top: 0, bottom: 0, right: 0, left: 0},
            // Main bg color
            backgroundColor: "rgba(255, 255, 255, 0)"
          },
          colors: ["#d12610", "#37b7f3", "#52e136"],
          xaxis: {
            font: {
              size: 13,
              lineHeight: 13,
              //style: "italic",
              //weight: "bold",
              family: "'pt-sans', sans-serif",
              //variant: "small-caps",
              color: "#eee"
            },
            ticks: 7,
            tickDecimals: 0,
            tickColor: "rgba(255, 255, 255, 0)",
            position: 'top',
            tickSize: 0,
            tickFormatter:  weeksformatter
          },
          yaxis: {
            font: {
              size: 11,
              lineHeight: 13,
              //style: "italic",
              //weight: "bold",
              family: "'pt-sans', sans-serif",
              //variant: "small-caps",
              color: "#eee",
              padding: '15px'
            },
            ticks: 7,
            tickDecimals: 0,
            tickColor: "#eee",
            position: 'right'
          }
        };
      var plot = $.plot(chartEl, data, options);
      var previousPoint = null;
      $("#chart_" + chartID).bind("plothover", function(event, pos, item) {
        $("#x").text(pos.x);
        $("#y").text(pos.y);

        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;

            $("#tooltip").remove();
            var x = DataProcessing.toDateFormat(item.datapoint[0]),
              y = item.datapoint[1];

            showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });

      var debounce = Debounce(function() {
        $.plot(chartEl, data, options);
      }, 300, false);
      debounceArray.push(debounce);

      return false;
    };


    // ************ Line chart **************** //
    var lineChartInit = function(chartID, chartData, tooltipLabel, chartColor) {
      if ($('#chart_' + chartID).size() != 1) {
        return;
      }
      var pageviews = chartData;
      var chartEl = $("#chart_" + chartID);
      var data = [{
        data: pageviews,
        label: tooltipLabel,
        lines: {
          // Main line width
          lineWidth: 1,
        },
        shadowSize: 1,
        // Main line color
        color: chartColor
      }];

      var options = {
        legend: {
          show: false
        },
        series: {
          lines: {
            show: true,
            lineWidth: 5,
            // Fill underline
            fill: false,
            color: "rgba(255, 255, 255, 0.8)",
            fillColor: {
              colors: [{
                opacity: 0.09
              }, {
                opacity: 0.01
              }]
            }
          },
          points: {
            show: true,
            radius: 5,
            lineWidth: 1,
            fill: true,
            fillColor: chartColor,
            last: true
          },
          shadowSize: 2
        },
        grid: {
          // show false removes too much border
          //show: false,
          hoverable: true,
          clickable: true,
          borderWidth: {top: 0, bottom: 0, right: 0, left: 0},
          // Main bg color
          backgroundColor: "rgba(255, 255, 255, 0)"
        },
        colors: ["#d12610", "#37b7f3", "#52e136"],
        xaxis: {
          show: false
        },
        yaxis: {
          show: false
        }
      };
      var plot = $.plot(chartEl, data, options);
      var previousPoint = null;
      $("#chart_" + chartID).bind("plothover", function(event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#tooltip").remove();
            var x = DataProcessing.toDateFormat(item.datapoint[0]),
              y = item.datapoint[1].toFixed(2);
            showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
      var debounce = Debounce(function() {
        $.plot(chartEl, data, options);
      }, 300, false);
      debounceArray.push(debounce);

      return false;
    };

    // ************ Donut chart **************** //
    var donutChartInit = function(chartID, chartData, tooltipLabel, chartColor) {
      if ($('#chart_' + chartID).size() != 1) {
        return;
      }
      var chartEl = '#chart_' + chartID,
          options = {
            series: {
              pie: {
                innerRadius: 0.97,
                stroke: {width: 0, color: "#eee"},
                show: true
              },
              endPoint: true,
              legend: {
                show: false
              }
            }
          };
      var plot = $.plot(chartEl, chartData, options);
      var debounce = Debounce(function() {
        $.plot(chartEl, chartData, options);
      }, 300, false);
      debounceArray.push(debounce);

      return false;
    };

    // ************ Pie chart **************** //
    var pieChartInit = function(chartID, chartData, tooltipLabel, chartColor) {
      if ($('#chart_' + chartID).size() != 1) {
        return;
      }
      var chartEl = '#chart_' + chartID,
        options = {
          series: {
            pie: {
              show: true,
              //stroke: {width: 1, color: "#44A2E0"},
              stroke: {width: 1, color: "rgba(0, 0, 0, 0.1)"},
              label: {
                show: false,
                radius: 1
              }
            }
          },
          legend: {
            show: false
          }
        };
      var plot = $.plot(chartEl, chartData, options);
      var debounce = Debounce(function() {
        $.plot(chartEl, chartData, options);
      }, 300, false);
      debounceArray.push(debounce);
      return false;
    };

    // ************ Bar chart **************** //
    var barChartInit = function(chartID, chartData, tooltipLabel, chartColor) {
      if ($('#chart_' + chartID).size() != 1) {
        return;
      }
      var data = [],
        xticks = [],
        yticks = [];

      for (var x = 0; x < 11; x++) {
        yticks.push([x * 10, (x * 10) + '%']);
      }

      for (var i = 0; i < chartData.length; i++) {
        var obj = chartData[i];
        xticks.push([i, obj.processorId]);
        data.push({
          data: [obj.val],
          color: obj.val[1] >= 90 ? "red" : "green",
          processorId: obj.processorId,
          lines: {
            lineWidth: 1
          },
          shadowSize: 0
        });
      }
      var chartEl = '#chart_' + chartID,
        options = {
          series: {
            bars: {
              show: true
            }
          },
          bars: {
            barWidth: 0.5,
            lineWidth: 0, // in pixels
            shadowSize: 0,
            align: 'center'
          },
          grid: {
            tickColor: "#eee",
            borderColor: "rgba(255, 255, 255, 0)",
            borderWidth: 0,
            hoverable: true
          },
          xaxis: {
            font: {
              size: 13,
              lineHeight: 33,
              //style: "italic",
              //weight: "bold",
              family: "'pt-sans', sans-serif",
              //variant: "small-caps",
              color: "#eee"
            },
            tickColor: "rgba(255, 255, 255, 0)",
            ticks: xticks,
            show: (Metronic.getViewPort().width > 600 && xticks.length <= 10) || (Metronic.getViewPort().width < 600 && xticks.length < 3)
          },
          yaxis: {
            font: {
              size: 11,
              lineHeight: 13,
              //style: "italic",
              //weight: "bold",
              family: "'pt-sans', sans-serif",
              //variant: "small-caps",
              color: "#eee"
            },
            ticks: yticks
          }
        };

      var plot = $.plot(chartEl, data, options);
      var previousPoint = null;
      $('#chart_' + chartID).bind("plothover", function(event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#tooltip").remove();
            showTooltip(item.pageX, item.pageY, item.series.processorId);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
      angular.element($window).bind("resize", function() {
        options.xaxis.show = (Metronic.getViewPort().width > 600 && xticks.length <= 10) || (Metronic.getViewPort().width < 600 && xticks.length < 3)
        $.plot(chartEl, data, options);
      });
      //
      //var debounce = Debounce(function() {
      //  $.plot(chartEl, data, options);
      //}, 300, false);
      //debounceArray.push(debounce);
      return false;
    };

    return {
      lineChartInit: lineChartInit,
      dottedLineChartInit: dottedLineChartInit,
      donutChartInit: donutChartInit,
      pieChartInit: pieChartInit,
      barChartInit: barChartInit,
      makeData: makeData,
      redrawAllCharts: redrawAllCharts,
      dottedLineChartInitUniversal: dottedLineChartInitUniversal
    };
  });

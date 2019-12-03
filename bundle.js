
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    const CANDIDATES_2019 = {
        'g1': { name: 'KLAUS-WERNER IOHANNIS', color: '#2171b5' },
        'g2': { name: 'THEODOR PALEOLOGU', color: '#7fc6bc' },
        'g3': { name: 'ILIE-DAN BARNA', color: '#22ace4' },
        'g4': { name: 'HUNOR KELEMEN', color: '#aac52e' },
        'g5': { name: 'VASILICA-VIORICA DĂNCILĂ', color: '#fa8376' },
        'g6': { name: 'CĂTĂLIN-SORIN IVAN', color: '#4182e4' },
        'g7': { name: 'NINEL PEIA', color: '#2a5c70' },
        'g8': { name: 'SEBASTIAN-CONSTANTIN POPESCU', color: '#18533d' },
        'g9': { name: 'JOHN-ION BANU', color: '#345f4f' },
        'g10': { name: 'MIRCEA DIACONU', color: '#9379da' },
        'g11': { name: 'BOGDAN-DRAGOS-AURELIU MARIAN-STANOEVICI', color: '#bde67c' },
        'g12': { name: 'RAMONA-IOANA BRUYNSEELS', color: '#bf7ce6' },
        'g13': { name: 'VIOREL CATARAMĂ', color: '#7a344b' },
        'g14': { name: 'ALEXANDRU CUMPĂNAŞU', color: '#888622' },
    };

    const CANDIDATES_2019_2 = {
        'g1': { name: 'KLAUS-WERNER IOHANNIS', color: '#2171b5' },
        'g2': { name: 'VASILICA-VIORICA DĂNCILĂ', color: '#fa8376' },
    };

    const CANDIDATES_2014 = {};

    const LAYERLIST = [
        'counties_wgs84', 
        'counties_cart_wgs84', 
        'counties_cart_hex_10000_wgs84',
        'counties_cart_hex_10000d_wgs84'
    ];

    const width = 620,
        height = 660;

    const viewport_width = 740,
        viewport_height = 680;

    const colorScaleRed = d3.scaleThreshold()
        .domain( [0, 10, 20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100 ] )
        .range(d3.schemeReds[9]);

    const colorScaleBlue = d3.scaleThreshold()
        .domain( [0, 10, 20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100 ] )
        .range(d3.schemeBlues[9]);

    const colorScaleRed2 = d3.scaleQuantize()
        .domain( [ 0, 100 ] )
        .range(d3.schemeReds[9]);

    const colorScaleBlue2 = d3.scaleQuantize()
        .domain( [ 0, 100 ] )
        .range(d3.schemeBlues[9]);

    const projection = d3.geoAlbers()
        .center([24.7731, 45.7909])
        .rotate([-14, 3.3, -10])
        .parallels([37, 54])
        .scale(5000);

    const path = d3.geoPath()
        .projection(projection);

    const roundToNearestMultipleOf = m => n => Math.ceil(Math.round(n/m)*m);

    const fieldMap = (d) => {

        return {
            code: {
                '2014': d['Cod Birou Electoral'],
                '2019-11-10': d['Cod birou electoral'],
                '2019-11-24': d['Cod birou electoral'],
            },
            totValidVotes: {
                '2014': d['Numărul total al voturilor valabil exprimate'],
                '2019-11-10': d['c'],
                '2019-11-24': d['c'],
            },
            vote1: {
                '2014': d['VICTOR-VIOREL PONTA'],
                '2019-11-10': d['g5'],
                '2019-11-24': d['g2'],
            },
            candidate1: {
                '2014': CANDIDATES_2014['g5'],
                '2019-11-10': CANDIDATES_2019['g5'].name,
                '2019-11-24': CANDIDATES_2019_2['g2'].name,
            },
            vote2: {
                '2014': d['KLAUS-WERNER IOHANNIS'],
                '2019-11-10': d['g1'],
                '2019-11-24': d['g1'],
            },
            candidate2: {
                '2014': CANDIDATES_2014['g1'],
                '2019-11-10': CANDIDATES_2019['g1'].name,
                '2019-11-24': CANDIDATES_2019_2['g1'].name,
            },
            electoralDistrict: {
                '2014': d['Nume Judet'],
                '2019-11-10': d['Județ'],
                '2019-11-24': d['Județ'],
            },
            rate1: {
                '2014': d['VICTOR-VIOREL PONTA'] / d['Numărul total al voturilor valabil exprimate'] * 100,
                '2019-11-10': d.g5 / d.c * 100,
                '2019-11-24': d.g2 / d.c * 100,
            },
            rate1Color: {
                '2014': roundToNearestMultipleOf(5)(d['VICTOR-VIOREL PONTA'] / d['Numărul total al voturilor valabil exprimate'] * 100),
                '2019-11-10': roundToNearestMultipleOf(5)(d.g5 / d.c * 100),
                '2019-11-24': roundToNearestMultipleOf(5)(d.g2 / d.c * 100),
            },
            rate2: {
                '2014': d['KLAUS-WERNER IOHANNIS'] / d['Numărul total al voturilor valabil exprimate'] * 100,
                '2019-11-10': d.g1 / d.c * 100,
                '2019-11-24': d.g1 / d.c * 100,
            },
            rate2Color: {
                '2014': roundToNearestMultipleOf(5)(d['KLAUS-WERNER IOHANNIS'] / d['Numărul total al voturilor valabil exprimate'] * 100),
                '2019-11-10': roundToNearestMultipleOf(5)(d.g1 / d.c * 100),
                '2019-11-24': roundToNearestMultipleOf(5)(d.g1 / d.c * 100),
            }
        }
    };

    const pair = (array) => {
        return array.slice(1).map( (b, i) => {
            return [array[i], b];
        });
    };

    const colorLayers = (d) => {
        return ( d.properties.joined.rate1 > d.properties.joined.rate2 ) 
                    ? ( d.properties.joined.electionsDate === "2019-11-10")
                        ? colorScaleRed(d.properties.joined.rate1)
                        : colorScaleRed2(d.properties.joined.rate1)
                    : ( d.properties.joined.electionsDate === "2019-11-10")
                        ? colorScaleBlue(d.properties.joined.rate2)
                        : colorScaleBlue2(d.properties.joined.rate2);
    };

    const tooltip_div = d3.select("body")
        .append("tooltip_div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

    const highlight = (d) => {
        tooltip_div.transition()    
            .duration(200)    
            .style("opacity", .9);    
        tooltip_div.html(tooltipHTML(d))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        d3.selectAll(".CO-" + d.properties.joined.code)
            .attr("style", "stroke: #00ffff; stroke-Config.viewport_width: 2px; fill-opacity: 0.8; cursor: pointer;");
    };

    const tooltipHTML = (d) => {
        return d.properties.joined.candidate2 + " votes: " + d3.format(".2f")(d.properties.joined.rate2) + "% </br>" +
            d.properties.joined.candidate1 + " votes: " + d3.format(".2f")(d.properties.joined.rate1) + "% </br>" +
            "Electoral district: " + d.properties.joined.electoralDistrict + "</br>" +
            "Total valid votes: " + d.properties.joined.totValidVotes.toLocaleString() + "</br>" +
            ( (d.properties.cod_birou !== 48) ? "Valid votes / km²: " + d.properties.joined.vvot_sqkm + "</br>" : "");
    };

    const unHighlight = (d) => {
        tooltip_div.transition()    
            .duration(500)    
            .style("opacity", 0);
        d3.selectAll(".CO-" + d.properties.joined.code)
            .attr("style", "stroke: none; cursor: none;");
    };

    const repaint = () => {
        d3.select("#legend-percent").selectAll("*").remove();
        d3.select("#legend-population").selectAll("*").remove();
        d3.select("#geography").selectAll("*").remove();
        d3.select("#gastner-c-cartogram").selectAll("*").remove();
        d3.select("#gastner-g-cartogram").selectAll("*").remove();
        d3.select("#dorling-cartogram").selectAll("*").remove();
        d3.select("#demers-cartogram").selectAll("*").remove();
        d3.select("#noncont-cartogram").selectAll("*").remove();
        d3.select("#candidates-donut").selectAll("*").remove();
        d3.select("#counties-treemap").selectAll("*").remove();

        const svg1 = d3.select("#legend-percent").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + 150);
        const svg2 = d3.select("#legend-population").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-20 20 " + width + " " + height);
        const svg3 = d3.select("#geography").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg4 = d3.select("#gastner-c-cartogram").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg5 = d3.select("#gastner-g-cartogram").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg6 = d3.select("#dorling-cartogram").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg7 = d3.select("#demers-cartogram").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg8 = d3.select("#noncont-cartogram").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "-60 60 " + viewport_width + " " + viewport_height);
        const svg9 = d3.select("#candidates-donut").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "0 0 " + viewport_width + " " + viewport_height);
        const svg10 = d3.select("#counties-treemap").append("svg").attr("class", "chart-group").attr("preserveAspectRatio", "xMidYMid").attr("viewBox", "0 0 " + width + " " + height);

        return [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10];
    };

    const reMapFields = (data) => {
        data.forEach( d => {
            d.c = d.d1;
            d.g1 = d.e1;
            d.g2 = d.e2;
            d.g3 = d.e3;
            d.g4 = d.e4;
            d.g5 = d.e5;
            d.g6 = d.e6;
            d.g7 = d.e7;
            d.g8 = d.e8;
            d.g9 = d.e9;
            d.g10 = d.e10;
            d.g11 = d.e11;
            d.g12 = d.e12;
            d.g13 = d.e13;
            d.g14 = d.e14;
        });

        return data;
    };

    const groupvotesByCounties = (data) => {

        let resultByCounty = [];
        data.reduce( (res, data_row) => {
            const columns = ['c', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13', 'g14'];
            const district_code = data_row['Cod birou electoral'];

            if (!res[district_code]) {
                res[district_code] = {
                   'Cod birou electoral': district_code,
                   'Județ': data_row['Județ']
                };
                columns.forEach( col => {
                    res[district_code][col] = 0;
                });

                resultByCounty.push(res[district_code]);
            }        columns.forEach( col => {
                res[district_code][col] += Number(data_row[col]);
            });

            return res;
        }, {});

        return resultByCounty;
    };

    const groupVotesByCandidates = (resultByCounty, electionsDate) => {

        const resultByCandidates = [];
        let columns = [];

        if (electionsDate === "2019-11-10") {
            columns = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13', 'g14'];
        } else {
            columns = ['g1', 'g2'];
        }
        columns.forEach( col => {
            const result = resultByCounty.reduce( (res, data_row) => {
                if (!res[data_row[col]]) {
                    res[data_row['Județ']] = data_row[col];
                }
                return res;
            }, {});

            const keys = Object.keys(result);
            const votes = keys.map( v =>  result[v] );
            const total = votes.reduce((a, b) => a + b, 0);
            result.total = total || 0;
            result.candidateId = col;

            const candidateName = (electionsDate === "2019-11-10") ? CANDIDATES_2019[col].name : CANDIDATES_2019_2[col].name;
            resultByCandidates[candidateName] = result;
        });

        let keys = Object.keys(resultByCandidates);

        let totCountry = 0;
        keys.forEach( k => totCountry += resultByCandidates[k].total || 0);
        keys.forEach( k => {
            resultByCandidates[k].totalCountry = totCountry;
            resultByCandidates[k].rateCountry = ((resultByCandidates[k].total/totCountry) * 100).toFixed(3);
        });

        return resultByCandidates;
    };

    const groupElectoralDataByDistrict = (data, electionsDate) => {
        let electoralDataByDistrict = d3.map();
        data.forEach( d => {
            let fieldMap$1 = fieldMap(d);
            electoralDataByDistrict.set(fieldMap$1.code[electionsDate], {
                code: fieldMap$1.code[electionsDate],
                totValidVotes: fieldMap$1.totValidVotes[electionsDate],
                vote1: fieldMap$1.vote1[electionsDate],
                candidate1: fieldMap$1.candidate1[electionsDate],
                vote2: fieldMap$1.vote2[electionsDate],
                candidate2: fieldMap$1.candidate2[electionsDate],
                electoralDistrict: fieldMap$1.electoralDistrict[electionsDate],
                rate1: fieldMap$1.rate1[electionsDate],
                rate1Color: fieldMap$1.rate1Color[electionsDate],
                rate2: fieldMap$1.rate2[electionsDate],
                rate2Color: fieldMap$1.rate2Color[electionsDate],
            });
        });

        return electoralDataByDistrict;
    };

    const formatCountyData = (data, votesByCounties, electionsDate) => {

        const electoralDataByDistrict = groupElectoralDataByDistrict(votesByCounties, electionsDate);

        LAYERLIST.forEach( layer => {
            data.objects[layer].geometries = data.objects[layer].geometries
            .filter( d => { 
                return d;
            });
            data.objects[layer].geometries
            .forEach( d => {
                if  (typeof(electoralDataByDistrict.get(d.properties.cod_birou)) === "undefined" ) {
                    d.properties.joined = {
                        code: d.cod_birou,
                        candidate1: "",
                        candidate2: "",
                        districtAbbr: "",
                        electoralDistrict: "",
                        rate1: 0,
                        rate1Color: 0,
                        rate2: 0,
                        rate2Color: 0,
                        totValidVotes: 0,
                        totValidVotes_rate: 0,
                        vote1: 0,
                        vote2: 0,
                        vvot_sqkm: 0,
                        electionsDate: electionsDate,
                    };
                } else {
                    try {
                        d.properties.joined = electoralDataByDistrict.get(d.properties.cod_birou);
                        d.properties.joined.code = d.properties.cod_birou;
                        d.properties.joined.districtAbbr = d.properties.abbr;
                        d.properties.joined.vvot_sqkm = Math.ceil(d.properties.joined.totValidVotes / d.properties.area_sqkm);
                        d.properties.joined.electionsDate = electionsDate;

                        return d;
                    } catch (error) {
                        console.log(error);
                    }            }
            });
        });

        return data;
    };

    const mapDataFactory = (data, electionsData, electionsDate) => {

        const votesByCounties = groupvotesByCounties(electionsData),
            votesByCandidates = groupVotesByCandidates(votesByCounties, electionsDate);

        const formattedData = formatCountyData(data, votesByCounties, electionsDate);

        const votesStats = {
            formattedData: formattedData,
            votesByCounties: votesByCounties,
            votesByCandidates: votesByCandidates,
            electionsDate: electionsDate
        };

        return (callback, layer, svg) => {
            return callback(votesStats, layer, svg);
        }
    };

    const drawScaleBar = (votesStats, layer, svg) => {
        //https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464

        let data = votesStats.formattedData;

        data = topojson.feature(data, {
            type: "GeometryCollection",
            geometries: data.objects[layer].geometries
        });

        const g = svg.append("g");
        const projection$1 = projection;
        
        const miles = d3.geoScaleBar()
          .units("miles")
          .left(.45);
        const scaleBarMiles = g.append("g")
            .attr("transform",  `translate(${-110},${height})`);

        const kilometers = d3.geoScaleBar()
          .left(.45)
          .distance(100);

        const scaleBarKilometers = g.append("g")
          .attr("transform",  `translate(${-110},${height + 40})`);
          const redraw = () => {
            projection$1.fitSize([width, height], data);
            miles.fitSize([width, height], data).projection(projection$1);
            scaleBarMiles.call(miles);
            kilometers.fitSize([width, height], data).projection(projection$1);
            scaleBarKilometers.call(kilometers);
        };

        redraw();
        window.onresize = _ => redraw();

    };

    const drawVotesPercentageLegend = (votesStats, layer, svg) => {

        const data = votesStats.formattedData;
        const electionsDate = votesStats.electionsDate;
        const votesByCandidates = votesStats.votesByCandidates;

        let layerData = topojson.feature(data, data.objects[layer]).features;

        const keys = Object.keys(layerData);
        const values = keys.map( v => layerData[v] );

        const minRate1 = values.reduce(( (a, b) => (a.properties.joined.rate1Color < b.properties.joined.rate1Color) ? a : b ), values[0]);
        const maxRate1 = values.reduce(( (a, b) => (a.properties.joined.rate1Color > b.properties.joined.rate1Color) ? a : b ), values[0]);
        const minRate2 = values.reduce(( (a, b) => (a.properties.joined.rate2Color < b.properties.joined.rate2Color) ? a : b ), values[0]);
        const maxRate2 = values.reduce(( (a, b) => (a.properties.joined.rate2Color > b.properties.joined.rate2Color) ? a : b ), values[0]);
        
        const g = svg.append("g")
            .attr("transform", "translate(290, 80)");
        const g1 = svg.append("g")
            .attr("transform", "translate(0, 80)");

        const x = d3.scaleLinear()
            .domain([minRate1.properties.joined.rate1Color, maxRate1.properties.joined.rate1Color])
            .rangeRound([10, 300]);
        const x1 = d3.scaleLinear()
            .domain([maxRate2.properties.joined.rate2Color, minRate2.properties.joined.rate2Color])
            .rangeRound([10, 300]);

        g.selectAll("rect")
        .data(pair(x.ticks(10)))
        .enter().append("rect")
            .attr("height", 20)
            .attr("x", d => x(d[0]) )
            .attr("width", d => x(d[1]) - x(d[0]) )
            .style("fill", d => electionsDate === "2019-11-10" ? colorScaleRed(d[0]) : colorScaleRed2(d[0]) );
        g1.selectAll("rect")
            .data(pair(x1.ticks(10)))
            .enter().append("rect")
                .attr("height", 20)
                .attr("x", d => x1(d[0]) )
                .attr("width", d => x1(d[1]) - x1(d[0]) )
                .style("fill", d => colorScaleBlue(d[0]) );

        const xAxisCall = d3.axisBottom(x)
            .ticks(3).tickSize(30);
        g.append("g")
            .attr("class", "x axis")
            .call(xAxisCall);
        const xAxisCall1 = d3.axisBottom(x1)
            .ticks(3).tickSize(30);
        g1.append("g")
            .attr("class", "x axis")
            .call(xAxisCall1);

        const candidate1Text =  ( typeof(maxRate1.properties.joined.code) !== "undefined" )
            ? `${maxRate1.properties.joined.candidate1} (${d3.format(",.2f")(votesByCandidates[maxRate1.properties.joined.candidate1].rateCountry)} %)`
            : "";
        const candidate2Text = ( typeof(maxRate1.properties.joined.code) !== "undefined" )
            ? `${maxRate2.properties.joined.candidate2} (${d3.format(",.2f")(votesByCandidates[maxRate2.properties.joined.candidate2].rateCountry)} %)`
            : "";
        const totalCandidate1Text = ( typeof(maxRate1.properties.joined.code) !== "undefined" )
            ? `${maxRate2.properties.joined.candidate1} ${d3.format(",.0f")(votesByCandidates[maxRate2.properties.joined.candidate1].total)}`
            : "";
        const totalCandidate2Text = ( typeof(maxRate1.properties.joined.code) !== "undefined" )
            ? `${maxRate2.properties.joined.candidate2} ${d3.format(",.0f")(votesByCandidates[maxRate2.properties.joined.candidate2].total)}`
            : "";
        const totalCountryText = ( typeof(maxRate1.properties.joined.code) !== "undefined" )
            ? `TOTAL ${d3.format(",.0f")(votesByCandidates[maxRate2.properties.joined.candidate2].totalCountry)}`
            : "";

        g.append("text")
                .attr("class", "caption")
                .attr("x", x.range()[0] + 30 )
                .attr("y", -6)
                .attr("class", "bubble-label")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(`${candidate1Text}` );
        g1.append("text")
                .attr("class", "caption")
                .attr("x", x1.range()[0])
                .attr("y", -6)
                .attr("class", "bubble-label")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(`${candidate2Text}` );
        g1.append("text")
                .attr("class", "caption")
                .attr("x", x1.range()[0])
                .attr("y", 86)
                .attr("class", "bubble-label")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(`${totalCandidate2Text}` );
        g1.append("text")
                .attr("class", "caption")
                .attr("x", x1.range()[0])
                .attr("y", 106)
                .attr("class", "bubble-label")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(`${totalCandidate1Text}` );
        g1.append("text")
                .attr("class", "caption")
                .attr("x", x1.range()[0])
                .attr("y", 126)
                .attr("class", "bubble-label")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(`${totalCountryText}` );

    };

    const drawVotesByPopulationLegend = (votesStats, layer, svg) => {
        // http://www.ralphstraumann.ch/projects/swiss-population-cartogram/

        const data = votesStats.formattedData;

        let layerData = topojson.feature(data, data.objects[layer]).features;

        const keys = Object.keys(layerData);
        const values = keys.map( v => layerData[v] );
        layerData = values.sort( (a, b) => b.properties.joined.totValidVotes - a.properties.joined.totValidVotes );

        const margin = { left:5, right:5, top:10, bottom:15 };

        const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, d3.max(layerData, d => d.properties.joined.totValidVotes )])
            .range([0, 450]);

        const y = d3.scaleBand()
            .domain(layerData.map( d => d.properties.joined.districtAbbr ))
            .rangeRound([78, height])
            .padding(0.1);

        const xAxisCall = d3.axisTop(x)
            .ticks(5).tickSize(5);
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", d => "translate(55,70)" )
            .call(xAxisCall)
            .selectAll("text")
                .attr("y", "-5");

        const yAxisCall = d3.axisLeft(y)
            .ticks(10).tickSize(0);
        g.append("g")
            .attr("class", "y-axis")
            .attr("transform", d => "translate(60,0)" ) 
            .call(yAxisCall);

        const bar = g.selectAll("g.bar")
            .data(layerData)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", d => `translate(60,${y(d.properties.joined.districtAbbr)})` );
        
        bar.append("rect")
            .attr("width", d => x(d.properties.joined.totValidVotes) )
            .attr("height", y.bandwidth())
            .attr("class", "bar-county")
            .attr("class", d => `CO-${d.properties.joined.code}` )
            .attr("fill", d => colorLayers(d))
            .attr("d", path)
            .on("mouseover", d => highlight(d)) 
            .on("mouseout", d => unHighlight(d));

        bar.append("text")
            .attr("class", "value")
            .attr("x", d => x(d.properties.joined.totValidVotes) )
            .attr("y", y.bandwidth() / 2)
                .attr("dx", +3)
                .attr("dy", ".35em")
                .attr("text-anchor", "begin")
                .text( d => d3.format(",.0f")(d.properties.joined.totValidVotes) );

    };

    const drawCountiesTreemap = (votesStats, layer, svg) => {
        // https://bl.ocks.org/mbostock/4063582

        const votesByCounties = votesStats.votesByCounties;

        const nodes = topojson.feature(votesStats.formattedData, votesStats.formattedData.objects.counties_wgs84).features;

        let populationData = [];
        nodes.forEach( d => {
            return populationData.push({
                name: d.properties.joined.electoralDistrict,
                value: d.properties.joined.totValidVotes,
                properties: d.properties,
            });
        });

        const data = {
            "name": "Districts",
            "children": populationData,
        };

        const format = d3.format(",d");

        const treemap = data => d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .padding(1)
        .round(true)
            (d3.hierarchy(data)
                .eachBefore( d => { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));

        const root = treemap(data);

        const leaf = svg.selectAll("g")
          .data(root.leaves())
          .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
      
        leaf.append("rect")
            .attr("id", d => d.data.id)
            .attr("class", "districts")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return colorLayers(d.data); })
            .attr("fill-opacity", 0.6)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .on("mouseover", function(d) {
                tooltip_div.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip_div.html(`${d.ancestors().reverse().map(d => d.data.name).join("/")}</br>${format(d.value)} votes`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip_div.transition()
                    .duration(500)
                    .style("opacity", 0);
                });
      
        leaf.append("clipPath")
            .attr("id", d => `clip-${d.data.id}`)
            .append("use")
                .attr("xlink:href", d => `#${d.data.id}`);
      
        leaf.append("text")
            .attr("font-size", 10 + "px")
            .attr("clip-path", d => `url(#clip-${d.data.id})`)
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
            .join("tspan")
                .attr("x", 3)
                .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
                .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
                .text(d => d);
      
    };

    const drawCandidatesDonut = (votesStats, layer, svg) => {
        // bl.ocks.org/nbremer/b603c3e0f7a74794da87/519786faa068384a3b9a08c45ba3a8f356b84407

        const votesByCandidates = votesStats.votesByCandidates;
        const radius = Math.min(width, height) / 2 - 40;

        const keys = Object.keys(votesByCandidates);
        let data = keys.map( v => { return {
                    candidateId: votesByCandidates[v].candidateId,
                    name: v,
                    value: votesByCandidates[v].total,
                    percent: votesByCandidates[v].rateCountry,
            }
        });
        data = data.filter( d => d.value !== 0);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie()
            .sort(null)
            .value( d => d.value );

        const arc = d3.arc()
            .outerRadius(radius * 0.5)
            .innerRadius(radius * 0.8);
        
        const path = g.selectAll('path')
            .data(pie(data))
            .enter()
            .append("g")
            .on("mouseover", function(d) {
                  let g = d3.select(this)
                    .append("g")
                    .attr("class", "text-group");
                  g.append("text")
                    .attr("class", "name-text")
                    .text(`${d.data.name}`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '-1.2em');
              
                  g.append("text")
                    .attr("class", "value-text")
                    .text(`${d3.format(",.0f")(d.data.value)} votes ( ${d3.format(",.2f")(+d.data.percent)} % )`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.6em');
                })
                .on("mouseout",function(d) {
                    d3.select(this)
                        .attr("style", "stroke: none; cursor: none;")
                        .select(".text-group").remove();
                    })
                .append('path')
                .attr('d', arc)
                .attr("fill", (d, i) => {
                    return ( votesStats.electionsDate === "2019-11-10" )
                        ? CANDIDATES_2019[d.data.candidateId].color
                        : CANDIDATES_2019_2[d.data.candidateId].color;
                })
                .on("mouseover", function(d) {
                    d3.select(this)     
                        .attr("style", "stroke: #00ffff; stroke-width: 2px; fill-opacity: 0.8; cursor: pointer;");
                    })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .attr("style", "stroke: none; cursor: none;");
                    })
                .each( function(d, i) { 
                        this._current = i;
                        const firstArcSection = /(^.+?)L/;
                        let newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
                        newArc = newArc.replace(/,/g , " ");
                        if (d.endAngle > 90 * Math.PI/180) {
                            const startLoc 	= /M(.*?)A/,
                                middleLoc 	= /A(.*?)0 0 1/,
                                endLoc 		= /0 0 1 (.*?)$/;
                            let newStart, middleSec, newEnd;
                            newEnd = startLoc.exec( newArc )[1];
                            if (endLoc.exec( newArc )) {
                                newStart = endLoc.exec( newArc )[1];
                                middleSec = middleLoc.exec( newArc )[1];
                                newArc = `M${newStart}A${middleSec}0 0 0${newEnd}`;
                            } else {
                                const middleLoc2 = /A(.*?)0 1 1/;
                                const endLoc2 = /0 1 1 (.*?)$/;
                                newStart = endLoc2.exec( newArc )[1];
                                middleSec = middleLoc2.exec( newArc )[1];
                                newArc = `M${newStart}A${middleSec}1 1 0${newEnd}`;
                            }
                        }
                svg.append("path")
                    .attr("class", "hiddenDonutArcs")
                    .attr("id", "donutArc"+i)
                    .attr("d", newArc)
                    .style("fill", "none");
                });
            
            g.selectAll(".donutText")
                .data(pie(data))
                    .enter()
                        .append("text")
                        .attr("font-size", 12 + "px")
                        .attr("class", "donutText")
                        .attr("dy", (d,i) => d.endAngle > 90 * Math.PI/180 ? 18 : -11 )
                        .append("textPath")
                        .attr("startOffset","50%")
                        .style("text-anchor","start")
                        .attr("xlink:href", (d,i) => `#donutArc${i}`)
                        .text( d => `${d.data.name} ( ${d3.format(",.2f")(+d.data.percent)} % )`  );
            
    };

    const drawAreaLegend = (args) => {
        // https://bl.ocks.org/HarryStevens/b779b431075d1a2c5710e9b826736650/9060c2bdd4e553ed445dbdc0d3bec43c71ec37da

        const data = args.data,
            variable = args.variable,
            legendText = args.legendText,
            maxAreaSize = args.maxAreaSize,
            maxData = d3.max(data, d => d.properties.joined[variable]),
            areaScale = d3.scaleLinear()
                .range([5, maxAreaSize])
                .domain([0, maxData]),
            legendTextLeftPad = 8,
            legendWidth = maxAreaSize * 3,
            legendHeight = maxAreaSize * 2 + 10,
            legend = args.svg.append("g")
                        .attrs({
                            transform: d => `translate(${10},${height - 60})`
                        })
                        .attr("width", legendWidth)
                        .attr("height", legendHeight),
            legendData = [maxData, args.legendData[0], args.legendData[1]],
            legendArea = (args.typeOfArea === "circle")
                ? legend.selectAll(".legend-area")
                    .data(legendData)
                        .enter().append("circle")
                            .attr("class", "legend-area")
                            .attr("cy", d => areaScale(d) + 1)
                            .attr("cx", areaScale(maxData) + 1)
                            .attr("r", d => areaScale(d))
                : legend.selectAll(".legend-area")
                    .data(legendData)
                        .enter().append("rect")
                            .attr("class", "legend-area")
                            .attr("cy", d => areaScale(d) + 1)
                            .attr("cx", areaScale(maxData) + 1)
                            .attr("width", d => { return areaScale(d); })
                            .attr("height", d => { return areaScale(d); }),
            legendDottedLine = (args.typeOfArea === "circle")
                ? legend.selectAll(".legend-dotted-line")
                    .data(legendData)
                        .enter().append("line")
                            .attr("class", "legend-dotted-line")
                            .attr("x1", areaScale(maxData) + 1)
                            .attr("x2", areaScale(maxData) * 2 + legendTextLeftPad)
                            .attr("y1", d => areaScale(d) * 2 + 1)
                            .attr("y2", d => areaScale(d) * 2 + 1)
                : legend.selectAll(".legend-dotted-line")
                    .data(legendData)
                        .enter().append("line")
                            .attr("class", "legend-dotted-line")
                            .attr("x1", areaScale(maxData) + 1)
                            .attr("x2", areaScale(maxData) + legendTextLeftPad)
                            .attr("y1", d => areaScale(d))
                            .attr("y2", d => areaScale(d)),
            legendNumber = (args.typeOfArea === "circle")
                ? legend.selectAll(".legend-number")
                    .data(legendData)
                        .enter().append("text")
                            .attr("class", "legend-number")
                            .attr("x", areaScale(maxData) * 2 + legendTextLeftPad)
                            .attr("y", d => areaScale(d) * 2 + 5)
                            .text((d, i) => d + (i == legendData.length - 1 ? " " + legendText : ""))
                : legend.selectAll(".legend-number")
                    .data(legendData)
                        .enter().append("text")
                            .attr("class", "legend-number")
                            .attr("x", areaScale(maxData) + legendTextLeftPad)
                            .attr("y", d => areaScale(d) + 5)
                            .text((d, i) => d + (i == legendData.length - 1 ? " " + legendText : ""));
        
        return 1;

    };

    const draw = (votesStats, layer, svg) => {
        const geoData = votesStats.formattedData;

        var geojsonFeatures = topojson.feature(geoData, {
            type: "GeometryCollection",
            geometries: geoData.objects[layer].geometries
        });
        const thisMapPath = d3.geoPath()
            .projection(projection.fitSize([width, height], geojsonFeatures));

        const nodes = topojson.feature(geoData, geoData.objects[layer]).features;

        const mapFeatures = svg.append("g")
            .attr("class", "features")
            .selectAll("path")
                .data(nodes);

        mapFeatures.enter()
            .append("path")
            .attr("fill", d => colorLayers(d))
                .attr("d", thisMapPath)
                    .attr("class", d => `CO-${d.properties.joined.code}`)
                    .on("mouseover", d => highlight(d)) 
                    .on("mouseout", d => unHighlight(d));

        mapFeatures.exit()
            .each(function (d) {
                this._xhr.abort();
            })
            .remove();

        let dataForLabels = nodes;
        if (layer === 'counties_cart_hex_10000_wgs84') {
            const hexDissolved = topojson.feature(geoData, geoData.objects['counties_cart_hex_10000d_wgs84']).features;

            const mapOverlayFeatures = svg.append("g")
                .attr("class", "features-overlay")
                .selectAll("path")
                    .data(hexDissolved);

            mapOverlayFeatures.enter()
                .append("path")
                    .attr("fill", "none")
                    .attr("d", thisMapPath);

            dataForLabels = hexDissolved;
        }
        svg.selectAll(".feature-label")
            .data(dataForLabels)
            .enter().append("text")
                .attr("class", "feature-label" )
                .attr("transform", d => `translate(${thisMapPath.centroid(d)})`)
                .attr("dy", ".35em")
                .text( d => d.properties.joined.districtAbbr);

        if (layer !== "counties_wgs84") {
            if (layer.match("counties_cart_")) {
                drawAreaLegend( {
                    "typeOfArea": 'circle',
                    "data": nodes,
                    "variable": "totValidVotes",
                    "maxAreaSize": 55,
                    "svg": svg,
                    "legendData": [300000, 100000],
                    "legendText": "Total valid votes",
                });
            } else {
                drawAreaLegend( {
                    "typeOfArea": 'square',
                    "data": nodes, 
                    "variable": "totValidVotes",
                    "maxAreaSize": 120,
                    "svg": svg,
                    "legendData": [300000, 100000],
                    "legendText": "Total valid votes",
                });
            }
        }
    };

    const drawDorling = (votesStats, layer, svg) => {
        // https://bl.ocks.org/nitaku/49a6bde57d8d8555b6823c8c6d05c5a8/ac5cc21562ba29d015a6375d9a8e854020eede1f

        const geoData = votesStats.formattedData;

        var geojsonFeatures = topojson.feature(geoData, {
            type: "GeometryCollection",
            geometries: geoData.objects[layer].geometries
        });
        const thisMapPath = d3.geoPath()
            .projection(projection.fitSize([width, height], geojsonFeatures));

        const zoomableLayer = svg.append('g');
        const radius = d3.scaleSqrt().range([0, 55]);

        const simulation = d3.forceSimulation()
            .force('collision', d3.forceCollide( d => {
            return d.r + 0.35;
        })).force('attract', d3.forceAttract().target( d => {
            return [d.foc_x, d.foc_y];
        }));

        const contents = zoomableLayer.append('g');

        const getGeo = () => {
            const land = topojson.merge(geoData, geoData.objects.counties_wgs84.geometries);
            contents.append('path').attrs({ "class": 'land', d: thisMapPath(land) });

            const nodes = topojson.feature(geoData, geoData.objects[layer]).features;
            nodes.forEach( d => {
                if (d.geometry.type === 'Polygon') {
                    return d.main = d;
                } else if (d.geometry.type === 'MultiPolygon') {
                    const subpolys = [];
                    d.geometry.coordinates.forEach( p => {
                        const sp = {};
                        sp = {
                            coordinates: p,
                            properties: d.properties,
                            type: 'Polygon'
                        };
                        sp.area = d3.geoArea(sp);
                        return subpolys.push(sp);
                    });
                    return d.main = subpolys.reduce(( (a, b) => {
                        return (a.area > b.area) ? a : b;
                    }), subpolys[0]);
                }
            });

            const getBubbles = () => {
                const populationData = [];
                nodes.forEach( d => {
                    return populationData.push({
                        parent: 'romania',
                        country: d,
                        properties: d.properties,
                        totValidVotes: +d.properties.joined.totValidVotes,
                    });
                });

                radius.domain([ 0, d3.max(populationData, d => d.totValidVotes) ]);
                populationData.forEach( d => { 
                    return d.r = radius(d.totValidVotes); 
                });
                populationData.forEach( d => {
                    d.centroid = projection(d3.geoCentroid(d.country.main));
                    d.x = d.centroid[0];
                    d.y = d.centroid[1];
                    d.foc_x = d.centroid[0];
                    return d.foc_y = d.centroid[1];
                });

                const bubbles = zoomableLayer.selectAll('.bubble')
                    .data(populationData);
                const enBubbles = bubbles.enter()
                    .append('circle')
                    .attrs({
                        "class": d => `bubble CO-${d.properties.joined.code}`,
                        r: d => d.r,
                        fill: d => colorLayers(d) })
                    .on("mouseover", d => highlight(d)) 
                    .on("mouseout", d => unHighlight(d));

                const labels = zoomableLayer.selectAll('.feature-label')
                    .data(populationData);
                const enLabels = labels.enter()
                    .append('g')
                    .attrs({ "class": 'feature-label' });
                enLabels.append('text')
                    .text( d => d.properties.joined.districtAbbr)
                    .attrs({ dy: '0.35em' });

                simulation.nodes(populationData).stop();

                let j = 0;
                for (let i = j = 0, ref = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
                    simulation.tick();
                }

                enBubbles.attrs({
                    transform: d => `translate(${d.x},${d.y})`
                });
                return enLabels.attrs({
                    transform: d => `translate(${d.x},${d.y})`
                });

            };

            drawAreaLegend( {
                "typeOfArea": 'circle',
                "data": nodes,
                "variable": "totValidVotes", 
                "maxAreaSize": 55,
                "svg": svg,
                "legendData": [300000, 100000],
                "legendText": "Total valid votes",
            });

            return getBubbles();
        };

        getGeo();
        
    };

    const drawDemers = (votesStats, layer, svg) => {
        // https://bl.ocks.org/martgnz/34880f7320eb5a6745e2ed7de7914223

        const geoData = votesStats.formattedData;

        var geojsonFeatures = topojson.feature(geoData, {
            type: "GeometryCollection",
            geometries: geoData.objects[layer].geometries
        });
        const thisMapPath = d3.geoPath()
            .projection(projection.fitSize([width, height], geojsonFeatures));

        const padding = 3;
        const land = topojson.merge(geoData, geoData.objects.counties_wgs84.geometries);
        svg.append('path').attrs({ "class": 'land', d: thisMapPath(land) });

        const nodes = topojson.feature(geoData, geoData.objects[layer]).features;
        const font = d3.scaleLinear()
            .range([6, 20])
            .domain(d3.extent(nodes, d => d.properties.joined.totValidVotes));
        const size = d3.scaleSqrt()
            .range([5, 120])
            .domain(d3.extent(nodes, d => d.properties.joined.totValidVotes));

        nodes.forEach( d => {
            d.pos = thisMapPath.centroid(d);
            d.area = size(d.properties.joined.totValidVotes);
            [d.x, d.y] = d.pos;
        });

        const collide = () => {
            for (let k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
                for (let i = 0, n = nodes.length; i < n; ++i) {
                    for (let a = nodes[i], j = i + 1; j < n; ++j) {
                        let b = nodes[j],
                            x = a.x + a.vx - b.x - b.vx,
                            y = a.y + a.vy - b.y - b.vy,
                            lx = Math.abs(x),
                            ly = Math.abs(y),
                            r = a.area / 2 + b.area / 2 + padding;
                        if (lx < r && ly < r) {
                            if (lx > ly) {
                                lx = (lx - r) * (x < 0 ? -strength : strength);
                                (a.vx -= lx), (b.vx += lx);
                            } else {
                                ly = (ly - r) * (y < 0 ? -strength : strength);
                                (a.vy -= ly), (b.vy += ly);
                            }
                        }
                    }
                }
            }
        };

        const simulation = d3.forceSimulation(nodes)
            .force('x', d3.forceX(d => d.x).strength(0.1))
            .force('y', d3.forceY(d => d.y).strength(0.1))
            .force('collide', collide);
        for (let i = 0; i < 120; ++i) simulation.tick();

        const rect = svg
            .selectAll('g')
            .data(nodes)
            .enter()
                .append('g')
                .attr('transform', d => `translate(${d.x}, ${d.y})`);
        rect
            .append('rect')
            .attr("class", d => `bubble CO-${d.properties.joined.code}`)
            .attr('width', d => d.area)
            .attr('height', d => d.area)
            .attr('x', d => -d.area / 2)
            .attr('y', d => -d.area / 2)
            .attr('fill', d => colorLayers(d))
            .attr('rx', 2)
                .on("mouseover", d => highlight(d)) 
                .on("mouseout", d => unHighlight(d));
        rect
            .append('text')
            .attr("class", "feature-label" )
            .filter(d => d.area > 18)
            .style('font-family', 'sans-serif')
            .style('font-size', d => `${font(d.properties.joined.totValidVotes)}px`)
            .attr('text-anchor', 'middle')
            .attr('dy', 2)
            .text(d => d.properties.joined.districtAbbr);

        const node = svg.selectAll("rect")
            .data(nodes)
            .enter().append("rect")
            .attr("width", d => { return d.r * 2; })
            .attr("height", d => { return d.r * 2; });

        drawAreaLegend( {
            "typeOfArea": 'square',
            "data": nodes,
            "variable": "totValidVotes",
            "maxAreaSize": 120,
            "svg": svg,
            "legendData": [300000, 100000],
            "legendText": "Total valid votes",
        });
    };

    const drawNonCont = (votesStats, layer, svg) => {
        // https://strongriley.github.io/d3/ex/cartogram.html

        const geoData = votesStats.formattedData;
        var geojsonFeatures = topojson.feature(geoData, {
            type: "GeometryCollection",
            geometries: geoData.objects[layer].geometries
        });
        const thisMapPath = d3.geoPath()
            .projection(projection.fitSize([width, height], geojsonFeatures));

        const nodes = topojson.feature(geoData, geoData.objects[layer]).features;
        nodes.forEach( d => {
            d.properties.joined.totalValidVotesScale = Math.sqrt(d.properties.joined.totValidVotes / 300000);
            d.properties.joined.totValidVotes_rate = Math.ceil( d.properties.joined.totValidVotes / d.properties.joined.totalValidVotesScale ) || 0;
        });

        svg.append("g")
            .attr("class", "black")
            .selectAll("path")
                .data(nodes)
                .enter()
                .append("path")
                .attr("d", thisMapPath);
        svg.append("g")
            .attr("class", "land")
            .selectAll("path")
                .data(nodes)
                .enter()
                .append("path")
                .attr("d", thisMapPath);

        svg.append("g")
            .attr("class", "white")
            .selectAll("path")
                .data(nodes)
                .enter()
                .append("path")
                .attr("fill", d => colorLayers(d))
                .attr("transform", d => {
                    const centroid = thisMapPath.centroid(d),
                        x = centroid[0],
                        y = centroid[1];
                    return `translate(${x},${y})`
                        + `scale(${d.properties.joined.totalValidVotesScale || 0.6})`
                        + `translate(${-x},${-y})`;
                })
                .attr("d", thisMapPath)
                .attr("class", d => `CO-${d.properties.joined.code}` )
                    .on("mouseover", d => highlight(d)) 
                    .on("mouseout", d => unHighlight(d));

        const labels = svg.selectAll(".feature-label")
            .data(nodes)
            .enter().append("text")
                .attr("class", "feature-label" )
                .attr("transform", d => `translate(${thisMapPath.centroid(d)})`)
                .attr("dy", ".35em")
                .text( d => d.properties.joined.districtAbbr);

            drawAreaLegend( {
                "typeOfArea": 'square',
                "data": nodes,
                "variable": "totValidVotes_rate",
                "maxAreaSize": 120,
                "svg": svg,
                "legendData": [300000, 100000],
                "legendText": "Total valid votes",
            });

    };

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\App.svelte generated by Svelte v3.16.0 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'World',
        },
    });

    (() => {
        // const mapArea = d3.select("#chart").append('map-area');

        let geographicData, electionsData2019Round1, electionsData2019Round2;
        let electionsDate = "2019-11-24";
        let opts = {
            lines: 9,
            length: 4,
            width: 5,
            radius: 12,
            scale: 1,
            corners: 1,
            color: '#f40000',
            opacity: 0.25,
            rotate: 0,
            direction: 1,
            speed: 1,
            trail: 30,
            fps: 20,
            zIndex: 2e9,
            className: 'spinner',
            shadow: false,
            hwaccel: false,
            position: 'absolute',
           },
            target = document.getElementById('spinner'),
            spinner;

        d3.select("#rounds-btn")
            .on("click", function(){
                spinner = new Spinner(opts).spin(target);
                var button = d3.select(this);
                if (button.text() === "See Round 1"){
                    changeView(electionsData2019Round1, '2019-11-10');
                    button.text("See Round 2");
                }
                else {
                    changeView(electionsData2019Round2, '2019-11-24');
                    button.text("See Round 1");
                }            setTimeout(function() {
                    spinner.stop();
                }, 1000);
            });

        const promises = [
            d3.json("data/counties_bundle.json"),
            d3.csv("data/round1/pv_RO_PRSD_FINAL.csv"),
            d3.csv("data/round1/pv_SR_PRSD_FINAL.csv"),
            d3.csv("data/round1/pv_SR_PRSD-C_FINAL.csv"),
            d3.csv("data/round2/pv_RO_PRSD_FINAL.csv"),
            d3.csv("data/round2/pv_SR_PRSD_FINAL.csv"),
            d3.csv("data/round2/pv_SR_PRSD-C_FINAL.csv"),
        ];

        Promise.all(promises).then( data => {
            geographicData = data[0];
            let electionsData2019RORound1 = data[1],
                  electionsData2019SRRound1 = data[2],
                  electionsData2019SRCRound1 = data[3],
                  electionsData2019RORound2 = data[4],
                  electionsData2019SRRound2 = data[5],
                  electionsData2019SRCRound2 = data[6];

            electionsData2019SRCRound1 = reMapFields(electionsData2019SRCRound1);
            electionsData2019SRCRound2 = reMapFields(electionsData2019SRCRound2);

            electionsData2019Round1 = [...electionsData2019RORound1, ...electionsData2019SRRound1, ...electionsData2019SRCRound1];
            electionsData2019Round2 = [...electionsData2019RORound2, ...electionsData2019SRRound2, ...electionsData2019SRCRound2];

            changeView(electionsData2019Round2, electionsDate);
        }).catch( 
            error => console.log(error)
        );

        const changeView = (electionsData, electionsDate) => {

            const mapVehicle = mapDataFactory(geographicData, electionsData, electionsDate);

            const svgs = repaint();
            let svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10;
            [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10] = [...svgs];

            mapVehicle(drawVotesPercentageLegend, 'counties_wgs84', svg1);
            mapVehicle(drawVotesByPopulationLegend, 'counties_wgs84', svg2);

            mapVehicle(draw, 'counties_wgs84', svg3);
            mapVehicle(draw, 'counties_cart_wgs84', svg4);
            mapVehicle(draw, 'counties_cart_hex_10000_wgs84', svg5);
            mapVehicle(drawDorling, 'counties_wgs84', svg6);
            mapVehicle(drawDemers, 'counties_wgs84', svg7);
            mapVehicle(drawNonCont, 'counties_wgs84', svg8);

            mapVehicle(drawScaleBar, 'counties_wgs84', svg3);
            mapVehicle(drawCandidatesDonut, 'counties_wgs84', svg9);
            mapVehicle(drawCountiesTreemap, 'counties_wgs84', svg10);

        };

    }).call(undefined);

    return app;

}());
//# sourceMappingURL=bundle.js.map

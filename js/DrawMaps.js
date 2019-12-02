import * as Config from './Config.js';
import * as Utils from './Utils.js';
import { drawAreaLegend } from './DrawLegend.js';

export const draw = (votesStats, layer, svg) => {
    const geoData = votesStats.formattedData;

    var geojsonFeatures = topojson.feature(geoData, {
        type: "GeometryCollection",
        geometries: geoData.objects[layer].geometries
    });
    const thisMapPath = d3.geoPath()
        .projection(Config.projection.fitSize([Config.width, Config.height], geojsonFeatures));

    const nodes = topojson.feature(geoData, geoData.objects[layer]).features;

    const mapFeatures = svg.append("g")
        .attr("class", "features")
        .selectAll("path")
            .data(nodes);

    mapFeatures.enter()
        .append("path")
        .attr("fill", d => Utils.colorLayers(d))
            .attr("d", thisMapPath)
                .attr("class", d => `CO-${d.properties.joined.code}`)
                .on("mouseover", d => Utils.highlight(d)) 
                .on("mouseout", d => Utils.unHighlight(d));

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
    };

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

export const drawDorling = (votesStats, layer, svg) => {
    // https://bl.ocks.org/nitaku/49a6bde57d8d8555b6823c8c6d05c5a8/ac5cc21562ba29d015a6375d9a8e854020eede1f

    const geoData = votesStats.formattedData;

    var geojsonFeatures = topojson.feature(geoData, {
        type: "GeometryCollection",
        geometries: geoData.objects[layer].geometries
    });
    const thisMapPath = d3.geoPath()
        .projection(Config.projection.fitSize([Config.width, Config.height], geojsonFeatures));

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
                d.centroid = Config.projection(d3.geoCentroid(d.country.main));
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
                    fill: d => Utils.colorLayers(d) })
                .on("mouseover", d => Utils.highlight(d)) 
                .on("mouseout", d => Utils.unHighlight(d));

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

export const drawDemers = (votesStats, layer, svg) => {
    // https://bl.ocks.org/martgnz/34880f7320eb5a6745e2ed7de7914223

    const geoData = votesStats.formattedData;

    var geojsonFeatures = topojson.feature(geoData, {
        type: "GeometryCollection",
        geometries: geoData.objects[layer].geometries
    });
    const thisMapPath = d3.geoPath()
        .projection(Config.projection.fitSize([Config.width, Config.height], geojsonFeatures));

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
        .attr('fill', d => Utils.colorLayers(d))
        .attr('rx', 2)
            .on("mouseover", d => Utils.highlight(d)) 
            .on("mouseout", d => Utils.unHighlight(d));
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

    const tick = (e) => {
        node.attr("x", d => { return d.x - d.r; })
            .attr("y", d => { return d.y - d.r; });
    };

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

export const drawNonCont = (votesStats, layer, svg) => {
    // https://strongriley.github.io/d3/ex/cartogram.html

    const geoData = votesStats.formattedData;
    var geojsonFeatures = topojson.feature(geoData, {
        type: "GeometryCollection",
        geometries: geoData.objects[layer].geometries
    });
    const thisMapPath = d3.geoPath()
        .projection(Config.projection.fitSize([Config.width, Config.height], geojsonFeatures));

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
            .attr("fill", d => Utils.colorLayers(d))
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
                .on("mouseover", d => Utils.highlight(d)) 
                .on("mouseout", d => Utils.unHighlight(d));

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

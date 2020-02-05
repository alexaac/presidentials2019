import * as Utils from './Utils.js'
import mapDataFactory from './MapFactory.js'
import * as DrawLegend from './DrawLegend.js'
import * as DrawMaps from './DrawMaps.js'

import App from './App.svelte';

const app = new App({
    target: document.body,
    props: {
        name: 'World',
    },
});

export default app;

(() => {
    // const mapArea = d3.select("#chart").append('map-area');

    let geographicData, electionsData2019Round1, electionsData2019Round2;
    let electionsDate = "2019-11-24";

    // options for loading spinner
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

    // show spinner when changing view from round 1 to 2 and vice versa
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
            };
            setTimeout(function() {
                spinner.stop();
            }, 1000);
        })

    /* initiate getting the geographic data in json form
      initiate getting the csv data for both elections rounds,
      local (RO) and abroad (SR) */
    const promises = [
        d3.json("data/counties_bundle.json"),
        d3.csv("data/round1/pv_RO_PRSD_FINAL.csv"),
        d3.csv("data/round1/pv_SR_PRSD_FINAL.csv"),
        d3.csv("data/round1/pv_SR_PRSD-C_FINAL.csv"),
        d3.csv("data/round2/pv_RO_PRSD_FINAL.csv"),
        d3.csv("data/round2/pv_SR_PRSD_FINAL.csv"),
        d3.csv("data/round2/pv_SR_PRSD-C_FINAL.csv"),
    ]

    /* when data loads, remap fields for abroad data to match local data,
       then merge them for each round; use changeView to set the initial focus
       on the results from round 2 */
    Promise.all(promises).then( data => {
        geographicData = data[0];
        let electionsData2019RORound1 = data[1],
              electionsData2019SRRound1 = data[2],
              electionsData2019SRCRound1 = data[3],
              electionsData2019RORound2 = data[4],
              electionsData2019SRRound2 = data[5],
              electionsData2019SRCRound2 = data[6];

        electionsData2019SRCRound1 = Utils.reMapFields(electionsData2019SRCRound1);
        electionsData2019SRCRound2 = Utils.reMapFields(electionsData2019SRCRound2);

        electionsData2019Round1 = [...electionsData2019RORound1, ...electionsData2019SRRound1, ...electionsData2019SRCRound1];
        electionsData2019Round2 = [...electionsData2019RORound2, ...electionsData2019SRRound2, ...electionsData2019SRCRound2];

        changeView(electionsData2019Round2, electionsDate);
    }).catch( 
        error => console.log(error)
    );

    // switch the focus on results from round 1 to round 2 and vice versa
    const changeView = (electionsData, electionsDate) => {

        /* call the function that takes as input the geographic and elections
           data and date, formats the data, then draw the legend, maps and
           charts using the same shared data: formattedData, votesByCounties,
           votesByCandidates, electionsDate */
        const mapVehicle = mapDataFactory(geographicData, electionsData, electionsDate);

        // completely swipe out the previous view
        const svgs = Utils.repaint();
        let svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10;
        [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10] = [...svgs];

        /* call the function with a function as parameter and pass the data
           in the vehicle, for sharing and reuse */

        // legend based on the percentage of votes per the final candidates
        mapVehicle(DrawLegend.drawVotesPercentageLegend, 'counties_wgs84', svg1);
        // legend based on the number of votes per county
        mapVehicle(DrawLegend.drawVotesByPopulationLegend, 'counties_wgs84', svg2);

        // map for the counties with county id ~ district id data
        mapVehicle(DrawMaps.draw, 'counties_wgs84', svg3);
        // map for the counties as cartogram
        mapVehicle(DrawMaps.draw, 'counties_cart_wgs84', svg4);
        /* map for the counties as hexagons from the cartogram
        and overlay the outline of counties from a dissolved hexagons layer */
        mapVehicle(DrawMaps.draw, 'counties_cart_hex_10000_wgs84', svg5);

        // mapDorling cartogram based on number of votes from the geographic data
        mapVehicle(DrawMaps.drawDorling, 'counties_wgs84', svg6);
        // mapDemers cartogram based on number of votes from the geographic data
        mapVehicle(DrawMaps.drawDemers, 'counties_wgs84', svg7);
        // mapNon-Contiguous cartogram based on number of votes from the geographic data
        mapVehicle(DrawMaps.drawNonCont, 'counties_wgs84', svg8);

        // scalebar in miles and km, use geographic data to set extent
        mapVehicle(DrawLegend.drawScaleBar, 'counties_wgs84', svg3);
        // donut from the percentage of all candidates
        mapVehicle(DrawLegend.drawCandidatesDonut, 'counties_wgs84', svg9);
        // treemap from the total votes per county
        mapVehicle(DrawLegend.drawCountiesTreemap, 'counties_wgs84', svg10);

    };

}).call(this);
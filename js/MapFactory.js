import * as Config from './Config.js'
import * as Stats from './Stats.js'

const formatCountyData = (data, votesByCounties, electionsDate) => {

    const electoralDataByDistrict = Stats.groupElectoralDataByDistrict(votesByCounties, electionsDate);

    Config.LAYERLIST.forEach( layer => {
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
                };
            }
        });
    });

    return data;
}

const mapDataFactory = (data, electionsData, electionsDate) => {

    const votesByCounties = Stats.groupvotesByCounties(electionsData),
        votesByCandidates = Stats.groupVotesByCandidates(votesByCounties, electionsDate);

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

export default mapDataFactory;
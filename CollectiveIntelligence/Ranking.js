const _ = require('lodash');
let Euclidean = require('./Euclidean');
let Pearson = require('./Pearson');

module.exports = class Rank{
    getRecommendScores(prefs, person, similarity = 'sim_person') {
        let totals = {};
        let simSums = {};

        // Don't compare me to myself
        let prefsWithoutPerson = _.omit(prefs, person);

        _.forIn(prefsWithoutPerson, (value, key) => {

            let sim;
            if (similarity === 'sim_pearson')
                sim = Pearson.sim(prefs, person, key);

            if (similarity === 'sim_euclidean')
                sim = Euclidean.sim(prefs, person, key);

            // Ignore scores of zero or lower
            if (sim <= 0) return;

            _.each(prefs[key], (pref) => {

                let key = _.keys(pref)[0];
                let seen = _.some(prefs[person], key);

                if (!seen) {

                    // Similarity * Score
                    if (totals[key] === undefined) totals[key] = 0;
                    totals[key] += pref[key] * sim;

                    // Sum of similarities
                    if (simSums[key] === undefined) simSums[key] = 0;
                    simSums[key] += sim;

                }

            });

        });

        let scores = _.map(totals, (value, key) => {
            return {
                story: key,
                score: value / simSums[key]
            }
        });

        scores = _.reverse(_.sortBy(scores, 'score'));

        return scores;
    }
}

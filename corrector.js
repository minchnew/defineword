var fs = require('fs');

/**
 * Implementation of a toy spelling corrector described by Peter Novig.
 * http://norvig.com/spell-correct.html.
 */
function Corrector(sampleFile) {
    this.dict = {};

    // initial training
    this.train(fs.readFileSync(sampleFile, {encoding: 'utf-8'}));
}

Corrector.prototype.train = function (sample) {
    var that = this;
    this.dict = {};

    sample.toLowerCase().replace(/[a-z]+/g, function (word) {
        that.dict.hasOwnProperty(word) ? (that.dict[word] += 1) : (that.dict[word] = 1);
    });
};

Corrector.prototype.correct = function (word) {
    var candidates;

    ((candidates = this.knownWords([word])) && candidates.length) ||
    ((candidates = this.knownWords(this._edits1(word))) && candidates.length) ||
    ((candidates = this.knownWords(this._edits2(word))) && candidates.length) ||
    (candidates = [word]);

    return max(
        candidates,
        function (cand) {
            return this.dict.hasOwnProperty(cand) ? this.dict[cand] : 1;
        },
        this);
};

Corrector.prototype.isWordKnown = function (word) {
    return this.dict.hasOwnProperty(word);
};

Corrector.prototype.knownWords = function (words) {
    var that = this;
    return words.filter(function (word) {
        return that.dict.hasOwnProperty(word);
    });
};

Corrector.prototype._edits1 = function (word) {
    var res = [],
        pairs = [];
    var alphabet = 'abcdefghijklmnopqrstuvwxyz', i, j;

    function deletes(pair) {
        if (pair[1])
            return pair[0] + pair[1].slice(1);
        else
            return undefined;
    }

    function transposes(pair) {
        if (pair[1].length > 1)
            return pair[0] + pair[1][1] + pair[1][0] + pair[1].slice(2);
        else
            return undefined;
    }

    for (i = 0, len = word.length; i <= len; i++) {
        pairs.push([word.slice(0,i), word.slice(i)]);
    }

    res = res.concat(pairs.map(deletes));
    res = res.concat(pairs.map(transposes));

    for (j = 0; j < pairs.length; j++) {
        for (i = 0, len = alphabet.length; i < len; i++) {
            if (pairs[j][1])
                res.push(pairs[j][0] + alphabet[i] + pairs[j][1].slice(1));
        }
    }

    for (j = 0; j < pairs.length; j++) {
        for (i = 0, len = alphabet.length; i < len; i++) {
            res.push(pairs[j][0] + alphabet[i] + pairs[j][1]);
        }
    }

    return res.filter(function (x) { return !!x; });
};

Corrector.prototype._edits2 = function (word) {
    var that = this,
        res = [];

    this._edits1(word).each(function (x) {
        that._edits1(x).each(function (y) {
            that.dict.hasOwnProperty(y) && res.push(y);
        });
    });

    return res;
};

function max(lists, iteratee, context) {
    var index = -Infinity, maximum = -Infinity;

    var tmp = context ? lists.map(iteratee, context) : lists.map(iteratee);

    for (var i = 0, len = tmp.length; i < len; i++) {
        if (tmp[i] > maximum) {
            maximum = tmp[i];
            index = i;
        }
    }

    if (index !== -Infinity)
        return lists[index];
    else
        return -Infinity;
}

exports = module.exports  = new Corrector('big.txt');

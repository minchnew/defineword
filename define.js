#!/usr/bin/env node

var program = require('commander'),
    request = require('request'),
    chalk = require('chalk'),
    util = require('util');

program
    .version('1.0.0')
    .usage('word')
    .parse(process.argv);

var dict = {
    word: 'placeholder',

    api: 'https://www.googleapis.com/scribe/v1/research?\
key=AIzaSyDqVYORLCUXxSv7zneerIgC2UYMnxvPeqQ&\
dataset=dictionary&\
dictionaryLanguage=en&\
query=placeholder&\
callback=dict.prettyPrint',

    defineWord: function (word) {
        dict.word = word;

        request.get(
            dict.api.replace(/placeholder/, word),
            function (err, response, body) {
            if (err)
                // TODO: handle connection failure
                dict.error(err);
            else
                eval(body);
        });
    },

    error: function (err) {
        console.error(err);
    },

    prettyPrint: function (entry) {
        if (!entry.data) {
            // TODO: suggestions like 'Did you mean: define ...'
            console.log('Can not find word: ' + this.word);
        } else {
            var defs = entry.data[0].dictionary.definitionData;
            defs.forEach(dict._printDef);
        }
    },

    _printDef: function (def) {
        console.log(util.format('%s /%s/', def.pos, def.phoneticText));
        def.meanings.forEach(dict._printMeaning);
    },

    _printMeaning: function (meaning, index) {
        var meaningFormat = '    %d. %s',
            exampleFormat = '       "%s"',
            synonymFormat = '       synonyms: %s';

        // Meaning
        console.log(util.format(meaningFormat, index+1, meaning.meaning));
        // Examples
        meaning.examples && meaning.examples.forEach(function (eg) { console.log(util.format(exampleFormat, eg)); });
        // Synonyms
        meaning.synonyms && console.log(util.format(
            synonymFormat,
            meaning.synonyms.map(function (current) { return current.nym; }).join(', ')));
    }
};

dict.defineWord(program.args[0]);

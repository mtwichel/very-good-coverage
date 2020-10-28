const fs = require('fs');
const Handlebars = require("handlebars");

const roundToTwoDecimals = (num) => Math.round((num + Number.EPSILON) * 10000) / 100

function generateHtml(templateData) {
    Handlebars.registerHelper('coverage', function (hits, found) {
        if (found === 0) {
            // assume 0 found means 100% coverage
            return '100.00%';
        }
        return `${roundToTwoDecimals(hits / found)}%`;
    });

    Handlebars.registerHelper('coverageColor', function (hits, found) {
        if (found === 0) {
            // assume 0 found means 100% coverage
            return 'green';
        }
        if ((hits / found) <= 0.75) {
            return 'red';
        } else if ((hits / found) > 0.75 && (hits / found) < 1) {
            return 'yellow';
        } else if ((hits / found) === 1) {
            return 'green'
        }
    });

    Handlebars.registerHelper('prettyDate', function (date) {
        return date.toLocaleString();
    });

    const templateString = fs.readFileSync('./report-generator/template.handlebars', 'utf-8');

    const template = Handlebars.compile(templateString);
    const page = template(templateData);
    fs.writeFileSync('./exports/index.html', page);
}

module.exports = {
    generateHtml
}
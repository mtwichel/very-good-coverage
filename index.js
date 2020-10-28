const core = require("@actions/core");
const minimatch = require("minimatch");
const parse = require("lcov-parse");
const reportgen = require('./report-generator/generate-report');

function run() {
  const lcovPath = core.getInput("path");
  const minCoverage = core.getInput("min_coverage");
  const excluded = core.getInput("exclude");
  const excludedFiles = excluded.split(" ");

  parse(lcovPath, function (_, data) {
    if (typeof data === "undefined") {
      core.setFailed("parsing error!");
      return;
    }
    let totalLinesFound = 0;
    let totalLinesHit = 0;
    let totalFunctionsFound = 0;
    let totalFunctionsHit = 0;
    let totalBranchesFound = 0;
    let totalBranchesHit = 0;

    const filesTemplateData = [];

    data.forEach(element => {
      if (shouldCalculateCoverageForFile(element["file"], excludedFiles)) {
        totalLinesHit += element['lines']['hit'];
        totalLinesFound += element['lines']['found'];
        totalFunctionsFound += element['functions']['hit'];
        totalFunctionsHit += element['functions']['found'];
        totalBranchesHit += element['branches']['hit'];
        totalBranchesFound += element['branches']['found'];
      }

      filesTemplateData.push({
        path: element['file'],
        linesHit: element['lines']['hit'],
        linesFound: element['lines']['found'],
        functionsHit: element['functions']['hit'],
        functionsFound: element['functions']['found'],
        branchesHit: element['branches']['hit'],
        branchesFound: element['branches']['found'],
      });
    });

    const templateData = {
      totalLinesHit,
      totalLinesFound,
      totalFunctionsHit,
      totalFunctionsFound,
      totalBranchesHit,
      totalBranchesFound,
      files: filesTemplateData,
      date: new Date(Date.now()),
    };

    reportgen.generateHtml(templateData);

    const coverage = (totalLinesHit / totalLinesFound) * 100;
    const isValidBuild = coverage >= minCoverage;
    if (!isValidBuild) {
      core.setFailed(`Coverage ${coverage} is below the minimum ${minCoverage} expected`);
    }
  });
}

function shouldCalculateCoverageForFile(fileName, excludedFiles) {
  for (let i = 0; i < excludedFiles.length; i++) {
    const isExcluded = minimatch(fileName, excludedFiles[i]);
    if (isExcluded) {
      core.debug(`Excluding ${fileName} from coverage`);
      return false;
    }
  }
  return true;
}

run();

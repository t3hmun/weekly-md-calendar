// A ~~simple~~ script to generate weekly notes.
// Note: This script involves date time logic, which is never simple.
// I use these files as a diary in Obsidian. Every note is tagged with the timestamp and week number, I like to think in terms of what happened in a week.

import * as fs from "fs";
import {
  addDays,
  addWeeks,
  format,
  formatISO,
  getISOWeek,
  getISOWeekYear,
  getYear,
  parseISO,
} from "date-fns";

function log(message) {
  console.log(message);
}

log("Removing output directory");
fs.rmSync("./output", { recursive: true, force: true });

log("Creating output directory");
fs.mkdirSync("./output");

// FUN FACT: ISO Week 1 can start in the previous year, it is based on the first Thursday of the year.
// So the last few days of the year may be in the next year, this works fine for a weekly diary.

// for (let year = 2000; year <= 2030; year++) {
//   log(`${year}: ${parseISO(`${year}-W01`)}`);
// }

// createYearOfWeekFiles(2023);
// createYearOfWeekFiles(2024);
createYearOfWeekFiles(2025);

function createYearOfWeekFiles(thisYear) {
  const yearDate = new Date(thisYear, 0, 1);
  let weekNum = 1;
  // There can be 52 or 53 weeks in a year, so just loop until we hit the next *ISO* year.
  let yearFile = `---
timestamp: ${formatISO(yearDate)}
week: ${wFormat(yearDate)}
tags:
  - journal
---
<[[${thisYear - 1}]] | [[${thisYear + 1}]] >

## The Year


## Weekly Summaries
`;

  fs.mkdirSync(`./output/${thisYear}`);

  while (true) {
    const weekDate = parseISO(
      `${thisYear}-W${weekNum.toString().padStart(2, "0")}`,
    );
    const prevWeekDate = addWeeks(weekDate, -1);
    const nextWeekDate = addWeeks(weekDate, 1);

    createWeekFile(thisYear, weekDate, prevWeekDate, nextWeekDate);
    yearFile += `
### [[${wFormat(weekDate)}]] - ${format(weekDate, "MMM do")}

- `;

    // End once the ISO week-year does not match, not the actual year, which can be different.
    if (getISOWeekYear(nextWeekDate) !== thisYear) {
      break;
    }
    weekNum++;
  }

  const yearFilename = `./output/${thisYear}/${thisYear}.md`;
  fs.writeFileSync(yearFilename, yearFile);
}

function wFormat(date) {
  // The ISO week 1 can start on the previous year, so we need to get the ISO week year (format R).
  return format(date, "R-'W'II");
}

function createWeekFile(thisYear, weekDate, prevWeekDate, nextWeekDate) {
  const weekFormatted = wFormat(weekDate);
  const prevWeekFormatted = wFormat(prevWeekDate);
  const nextWeekFormatted = wFormat(nextWeekDate);
  // date-fns formatISO keeps the timezone unlike the native JS toISOString.
  const timestamp = formatISO(weekDate);
  log(`${weekFormatted}  (${weekDate})`);

  const filename = `./output/${thisYear}/${weekFormatted}.md`;
  const content = `---
timestamp: ${timestamp}
week: ${weekFormatted}
tags:
  - journal
---

<[[${prevWeekFormatted}]] | [[${thisYear}]] | [[${nextWeekFormatted}]] >

## Tasks

- [ ] 

## ${format(weekDate, "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +1), "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +2), "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +3), "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +4), "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +5), "yyyy-MM-dd EEEE")}

## ${format(addDays(weekDate, +6), "yyyy-MM-dd EEEE")}

`;

  log(`Creating file ${filename}`);
  fs.writeFileSync(filename, content);
}

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

// //FUN FACT: ISO Week 1 can start in the previous year, it is based on the first Thursday of the year.
// for (let year = 2000; year <= 2030; year++) {
//   log(`${year}: ${parseISO(`${year}-W01`)}`);
// }

createYearOfWeekFiles(2023);

function createYearOfWeekFiles(thisYear) {
  let weekNum = 1;
  // There can be 52 or 53 weeks in a year, so just loop until we hit the next *ISO* year.
  while (true) {
    const weekDate = parseISO(
      `${thisYear}-W${weekNum.toString().padStart(2, "0")}`,
    );
    const prevWeekDate = addWeeks(weekDate, -1);
    const nextWeekDate = addWeeks(weekDate, 1);

    createWeekFile(weekDate, prevWeekDate, nextWeekDate);

    // End once the ISO week-year does not mach, not the actual year, which can be different.
    if (getISOWeekYear(nextWeekDate) !== thisYear) {
      break;
    }
    weekNum++;
  }
}

function wFormat(date) {
  // The ISO week 1 can start on the previous year, so we need to get the ISO week year (format R).
  return format(date, "R-'W'II");
}

function createWeekFile(weekDate, prevWeekDate, nextWeekDate) {
  const weekFormatted = wFormat(weekDate);
  const prevWeekFormatted = wFormat(prevWeekDate);
  const nextWeekFormatted = wFormat(nextWeekDate);
  // date-fns formatISO keeps the timezone unlike the native JS toISOString.
  const timestamp = formatISO(weekDate);
  log(`${weekFormatted}  (${weekDate})`);

  const filename = `./output/${weekFormatted}.md`;
  const content = `---
timestamp: ${timestamp}
week: ${weekFormatted}
---
<[[${prevWeekFormatted}]] | [[${nextWeekFormatted}]] >

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

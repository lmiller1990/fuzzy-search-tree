// https://github.com/farzher/fuzzysort v2.0.3

import { FastPriorityQueue } from "./fpq.js";

interface InternalFuzzyResult {
  target: string;
  targetLower: string;
  targetLowerCodes: number[];
  nextBeginningIndexes: number[] | null;
  bigflags: number;
  score: number;
  indexes: number[];
}

type FuzzyResult = Pick<InternalFuzzyResult, "target" | "indexes">;

interface PreparedSearch {
  lowerCodes: number[];
  bitflags: number;
  lower: string;
}

interface Options {
  threshold: number;
  limit: number;
  // key: string;
  // keys: string[];
}

export function fuzzysort(
  search: string,
  targets: string[],
  options: Partial<Options> = {}
): Array<FuzzyResult> {
  const preparedSearch = getPreparedSearch(search);
  const searchBitflags = preparedSearch.bitflags;

  const threshold = (options && options.threshold) || Number.MIN_SAFE_INTEGER;
  const limit = options.limit || Number.MAX_SAFE_INTEGER;

  let resultsLen = 0;
  const targetsLen = targets.length;

  for (let i = 0; i < targetsLen; ++i) {
    let target = targets[i];

    if (!target) {
      continue;
    }

    const preparedTarget = getPrepared(target);

    if ((searchBitflags & preparedTarget.bigflags) !== searchBitflags) {
      continue;
    }

    const result = algorithm(preparedSearch, preparedTarget);

    if (!result) {
      continue;
    }

    if (result.score < threshold) continue;

    if (resultsLen < limit) {
      fpq.add(result);
      ++resultsLen;
    } else {
      const next = fpq.peek();
      if (next && result.score > next.score) {
        fpq.replaceTop(result);
      }
    }
  }

  if (resultsLen === 0) {
    return new Array<InternalFuzzyResult>(0);
  }

  const results = new Array<FuzzyResult>(resultsLen);

  for (let i = resultsLen - 1; i >= 0; --i) {
    let next: InternalFuzzyResult | undefined;
    if ((next = fpq.poll())) {
      results[i] = {
        target: next.target,
        indexes: next.indexes,
      };
    }
  }

  return results;
}

function prepare(target: string): InternalFuzzyResult {
  const info = prepareLowerInfo(target);
  return {
    target: target,
    targetLower: info.lower,
    targetLowerCodes: info.lowerCodes,
    nextBeginningIndexes: null,
    bigflags: info.bitflags,
    score: -Number.MIN_SAFE_INTEGER,
    indexes: [0],
  };
}

// Below this point is only internal code
// Below this point is only internal code
// Below this point is only internal code
// Below this point is only internal code
function prepareSearch(search: string): PreparedSearch {
  if (typeof search !== "string") search = "";
  search = search.trim();
  let info = prepareLowerInfo(search);

  return {
    lowerCodes: info.lowerCodes,
    bitflags: info.bitflags,
    lower: info.lower,
  };
}

function getPrepared(target: string): InternalFuzzyResult {
  if (target.length > 999) return prepare(target); // don't cache huge targets
  let targetPrepared = preparedCache.get(target);
  if (targetPrepared !== undefined) return targetPrepared;
  targetPrepared = prepare(target);
  preparedCache.set(target, targetPrepared);
  return targetPrepared;
}

function getPreparedSearch(search: string): PreparedSearch {
  if (search.length > 999) {
    return prepareSearch(search); // don't cache huge searches
  }

  let searchPrepared = preparedSearchCache.get(search);
  if (searchPrepared) {
    return searchPrepared;
  }
  searchPrepared = prepareSearch(search);
  preparedSearchCache.set(search, searchPrepared);
  return searchPrepared;
}

function prepareLowerInfo(str: string): PreparedSearch {
  let strLen = str.length;
  let lower = str.toLowerCase();
  let lowerCodes: number[] = []; // new Array(strLen)    sparse array is too slow
  let bitflags = 0;

  for (let i = 0; i < strLen; ++i) {
    let lowerCode = (lowerCodes[i] = lower.charCodeAt(i));

    let bit =
      lowerCode >= 97 && lowerCode <= 122
        ? lowerCode - 97 // alphabet
        : lowerCode >= 48 && lowerCode <= 57
        ? 26 // numbers
        : // 3 bits available
        lowerCode <= 127
        ? 30 // other ascii
        : 31; // other utf8
    bitflags |= 1 << bit;
  }

  return {
    lowerCodes,
    bitflags,
    lower,
  };
}

function prepareBeginningIndexes(target: string) {
  let targetLen = target.length;
  let beginningIndexes: number[] = [];
  let beginningIndexesLen = 0;
  let wasUpper = false;
  let wasAlphanum = false;
  for (let i = 0; i < targetLen; ++i) {
    let targetCode = target.charCodeAt(i);
    let isUpper = targetCode >= 65 && targetCode <= 90;
    let isAlphanum =
      isUpper ||
      (targetCode >= 97 && targetCode <= 122) ||
      (targetCode >= 48 && targetCode <= 57);
    let isBeginning = (isUpper && !wasUpper) || !wasAlphanum || !isAlphanum;
    wasUpper = isUpper;
    wasAlphanum = isAlphanum;
    if (isBeginning) beginningIndexes[beginningIndexesLen++] = i;
  }
  return beginningIndexes;
}

function prepareNextBeginningIndexes(target: string): Array<number> {
  const targetLen = target.length;
  const beginningIndexes = prepareBeginningIndexes(target);
  const nextBeginningIndexes: number[] = []; // new Array(targetLen)     sparse array is too slow
  let lastIsBeginning = beginningIndexes[0];
  let lastIsBeginningI = 0;
  for (let i = 0; i < targetLen; ++i) {
    if (lastIsBeginning > i) {
      nextBeginningIndexes[i] = lastIsBeginning;
    } else {
      lastIsBeginning = beginningIndexes[++lastIsBeginningI];
      nextBeginningIndexes[i] = !lastIsBeginning ? targetLen : lastIsBeginning;
    }
  }
  return nextBeginningIndexes;
}

const preparedCache = new Map();
const preparedSearchCache = new Map();
let matchesSimple: number[] = [];
let matchesStrict: number[] = [];

const fpq = new FastPriorityQueue<InternalFuzzyResult>();

function algorithm(
  preparedSearch: PreparedSearch,
  prepared: InternalFuzzyResult
): InternalFuzzyResult | null {
  let searchLower = preparedSearch.lower;
  let searchLowerCodes = preparedSearch.lowerCodes;
  let searchLowerCode = searchLowerCodes[0];
  let targetLowerCodes = prepared.targetLowerCodes;
  let searchLen = searchLowerCodes.length;
  let targetLen = targetLowerCodes.length;
  let searchI = 0; // where we at
  let targetI = 0; // where you at
  let matchesSimpleLen = 0;

  // very basic fuzzy match; to remove non-matching targets ASAP!
  // walk through target. find sequential matches.
  // if all chars aren't found then exit
  for (;;) {
    const isMatch = searchLowerCode === targetLowerCodes[targetI];
    if (isMatch) {
      matchesSimple[matchesSimpleLen++] = targetI;
      ++searchI;
      if (searchI === searchLen) break;
      searchLowerCode = searchLowerCodes[searchI];
    }
    ++targetI;
    if (targetI >= targetLen) {
      return null;
    }
  }

  searchI = 0;
  let successStrict = false;
  let matchesStrictLen = 0;

  let nextBeginningIndexes = prepared.nextBeginningIndexes;

  if (!nextBeginningIndexes) {
    const next = prepareNextBeginningIndexes(prepared.target);
    nextBeginningIndexes = next;
    prepared.nextBeginningIndexes = next;
  }

  // Our target string successfully matched all characters in sequence!
  // Let's try a more advanced and strict test to improve the score
  // only count it as a match if it's consecutive or a beginning character!
  let backtrackCount = 0;
  if (targetI !== targetLen)
    for (;;) {
      if (targetI >= targetLen) {
        // We failed to find a good spot for this search char, go back to the previous search char and force it forward
        if (searchI <= 0) break; // We failed to push chars forward for a better match

        ++backtrackCount;
        if (backtrackCount > 200) break; // exponential backtracking is taking too long, just give up and return a bad match

        --searchI;
        let lastMatch = matchesStrict[--matchesStrictLen];
        targetI = nextBeginningIndexes[lastMatch];
      } else {
        let isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
        if (isMatch) {
          matchesStrict[matchesStrictLen++] = targetI;
          ++searchI;
          if (searchI === searchLen) {
            successStrict = true;
            break;
          }
          ++targetI;
        } else {
          targetI = nextBeginningIndexes[targetI];
        }
      }
    }

  // check if it's a substring match
  let substringIndex = prepared.targetLower.indexOf(
    searchLower,
    matchesSimple[0]
  ); // perf: this is slow
  let isSubstring = ~substringIndex;
  if (isSubstring && !successStrict) {
    // rewrite the indexes from basic to the substring
    for (let i = 0; i < matchesSimpleLen; ++i)
      matchesSimple[i] = substringIndex + i;
  }
  let isSubstringBeginning = false;
  if (isSubstring) {
    isSubstringBeginning =
      // we set this earlier, it exists
      prepared.nextBeginningIndexes![substringIndex - 1] === substringIndex;
  }

  let matchesBest: number[];
  let matchesBestLen: number;
  // tally up the score & keep track of matches for highlighting later
  if (successStrict) {
    matchesBest = matchesStrict;
    matchesBestLen = matchesStrictLen;
  } else {
    matchesBest = matchesSimple;
    matchesBestLen = matchesSimpleLen;
  }

  let score = 0;

  let extraMatchGroupCount = 0;
  for (let i = 1; i < searchLen; ++i) {
    if (matchesBest[i] - matchesBest[i - 1] !== 1) {
      score -= matchesBest[i];
      ++extraMatchGroupCount;
    }
  }
  let unmatchedDistance =
    matchesBest[searchLen - 1] - matchesBest[0] - (searchLen - 1);

  score -= (12 + unmatchedDistance) * extraMatchGroupCount; // penality for more groups

  if (matchesBest[0] !== 0) score -= matchesBest[0] * matchesBest[0] * 0.2; // penality for not starting near the beginning

  if (!successStrict) {
    score *= 1000;
  } else {
    // successStrict on a target with too many beginning indexes loses points for being a bad target
    let uniqueBeginningIndexes = 1;
    for (
      let i = nextBeginningIndexes[0];
      i < targetLen;
      i = nextBeginningIndexes[i]
    )
      ++uniqueBeginningIndexes;

    if (uniqueBeginningIndexes > 24)
      score *= (uniqueBeginningIndexes - 24) * 10; // quite arbitrary numbers here ...
  }

  if (isSubstring) score /= 1 + searchLen * searchLen * 1; // bonus for being a full substring
  if (isSubstringBeginning) score /= 1 + searchLen * searchLen * 1; // bonus for substring starting on a beginningIndex

  score -= targetLen - searchLen; // penality for longer targets
  prepared.score = score;

  for (let i = 0; i < matchesBestLen; ++i) {
    prepared.indexes[i] = matchesBest[i];
  }

  prepared.indexes.length = matchesBestLen;

  return prepared;
}

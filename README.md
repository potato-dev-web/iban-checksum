# iban-checksum

[![npm version](https://img.shields.io/npm/v/iban-checksum.svg)](https://www.npmjs.com/package/iban-checksum)

A tiny, dependency-free check that a string looks like an IBAN and passes the mod-97 checksum, plus two helpers to clean it up and print it nicely.

- Zero dependencies, ESM, Node 18+
- Hand-written TypeScript types included
- MIT license

## Install

```sh
npm install iban-checksum
```

- npm: [npmjs.com/package/iban-checksum](https://www.npmjs.com/package/iban-checksum)
- Source and issues: [github.com/potato-dev-web/iban-checksum](https://github.com/potato-dev-web/iban-checksum)

## Usage

```js
import { isValidIbanChecksum, normalizeIban, formatIban } from "iban-checksum";

isValidIbanChecksum("GB29 NWBK 6016 1331 9268 19");  // true
isValidIbanChecksum("gb29nwbk60161331926819");        // true  (case and spaces don't matter)
isValidIbanChecksum("GB29 NWBK 6016 1331 9268 18");  // false (last digit changed)
isValidIbanChecksum("GB29 NWBK 6016 1331 9268 91");  // false (last two digits swapped)
isValidIbanChecksum("");                              // false
isValidIbanChecksum("GB29");                          // false (too short)
isValidIbanChecksum("GB29 NWBK 6016 1331 9268 1!");  // false (bad character)

normalizeIban(" gb29 nwbk-6016 1331 9268 19 ");       // "GB29NWBK60161331926819"
formatIban("nl91abna0417164300");                     // "NL91 ABNA 0417 1643 00"
formatIban(normalizeIban("DE89-3704-0044-0532-0130-00")); // "DE89 3704 0044 0532 0130 00"
isValidIbanChecksum("DE89 3704 0044 0532 0130 01");  // false
```

The output shown in the comments above is real: every line was run and printed exactly that.

### What each function does

| Function | Returns | Notes |
|---|---|---|
| `isValidIbanChecksum(input)` | `boolean` | Never throws. Anything that isn't a string returns `false`. |
| `normalizeIban(input)` | `string` | Removes spaces, tabs, line breaks and hyphens, then uppercases. Throws `TypeError` for non-strings. |
| `formatIban(input)` | `string` | Normalizes, then groups in fours separated by a space. Doesn't check validity. Throws `TypeError` for non-strings. |

`isValidIbanChecksum` accepts a string if, after normalizing, it is 2 letters, 2 digits, then 1 to 30 letters or digits (so at most 34 characters), and the mod-97 remainder is 1.

## What this does NOT check

- **Country length.** A string with the right shape and a correct checksum passes, even if that country's IBANs have a different length.
- **Whether the country code exists.** `XX` is treated like any other two letters.
- **Whether the account exists.** A passing result means "well-formed", nothing more. The bank has never heard of it.
- **Typo fixes.** If the check fails, you only get `false`. There is no "did you mean?" and no hint about which character is wrong.
- **Bank or branch details.** Nothing is parsed out of the IBAN.

## How mod-97 works, and what it catches

1. Take the IBAN without spaces, and move the first four characters (country code and check digits) to the end.
2. Turn each letter into a number: A = 10, B = 11 ... Z = 35.
3. Read the result as one long number and divide by 97. If the remainder is 1, the checksum passes.

The long number is too big for a normal JavaScript number, so this package carries the remainder along one character at a time instead.

What that gives you:

- A single wrong digit is always caught. The same goes for a single wrong letter replaced by another letter.
- Swapping two *different* adjacent digits is always caught.
- Random garbage with the right shape passes only about 1 time in 97.

What it can't do: it can't tell you *which* character is wrong, and about 1 in 97 random mistakes (for example some multi-character errors) will slip through, because 97 possible remainders is all the check has to work with.

## Need more?

*Disclosure: I also run a paid API, and this section is about it.*

This package is deliberately small. If you need more than a format and checksum check, I run a hosted API that adds:

- Per-country length and structure checks (89 countries)
- Batch checking of up to 75 IBANs in one call
- "Did you mean?" suggestions for typos (candidates, never automatic corrections)
- Stable error codes you can switch on (for example `IBAN_BAD_CHECKSUM`)

How well do the suggestions work? In my own test of 267 single-character typos, suggestions recovered the original about 4 in 10 times (105 of 267, 39%). The rest were ambiguous, so the API returned no suggestion rather than guess. My server never logs request bodies.

- Zyla API Hub: https://zylalabs.com/api-marketplace/finance+%26+payments/iban+validator+and+fixer+api/15582

You don't need it to use this package.

## License

MIT, see [LICENSE](./LICENSE).

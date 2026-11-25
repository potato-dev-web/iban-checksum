import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidIbanChecksum, normalizeIban, formatIban } from "../src/index.js";

const VALID = [
  "GB29NWBK60161331926819",
  "DE89370400440532013000",
  "NL91ABNA0417164300",
  "FR1420041010050500013M02606",
  "NO9386011117947",
];

test("valid examples pass", () => {
  for (const iban of VALID) assert.equal(isValidIbanChecksum(iban), true, iban);
});

test("spaces, hyphens and lowercase are accepted", () => {
  assert.equal(isValidIbanChecksum("GB29 NWBK 6016 1331 9268 19"), true);
  assert.equal(isValidIbanChecksum("gb29nwbk60161331926819"), true);
  assert.equal(isValidIbanChecksum("  de89-3704-0044-0532-0130-00 "), true);
});

test("changing any single digit fails", () => {
  const iban = "GB29NWBK60161331926819";
  for (let i = 4; i < iban.length; i++) {
    if (!/[0-9]/.test(iban[i])) continue;
    for (let d = 0; d <= 9; d++) {
      if (String(d) === iban[i]) continue;
      const changed = iban.slice(0, i) + d + iban.slice(i + 1);
      assert.equal(isValidIbanChecksum(changed), false, changed);
    }
  }
});

test("swapping two different adjacent digits fails", () => {
  const iban = "DE89370400440532013000";
  let swaps = 0;
  for (let i = 2; i < iban.length - 1; i++) {
    const a = iban[i];
    const b = iban[i + 1];
    if (a === b || !/[0-9]/.test(a + b)) continue;
    const swapped = iban.slice(0, i) + b + a + iban.slice(i + 2);
    assert.equal(isValidIbanChecksum(swapped), false, swapped);
    swaps++;
  }
  assert.ok(swaps > 10);
});

test("empty and whitespace-only input fail", () => {
  assert.equal(isValidIbanChecksum(""), false);
  assert.equal(isValidIbanChecksum("   "), false);
  assert.equal(isValidIbanChecksum(" - - "), false);
});

test("too short input fails", () => {
  assert.equal(isValidIbanChecksum("GB29"), false);
  assert.equal(isValidIbanChecksum("GB"), false);
  assert.equal(isValidIbanChecksum("G"), false);
});

test("too long input fails", () => {
  assert.equal(isValidIbanChecksum("GB29" + "1".repeat(31)), false);
});

test("bad characters fail", () => {
  assert.equal(isValidIbanChecksum("GB29NWBK6016133192681!"), false);
  assert.equal(isValidIbanChecksum("GB29NWBK60161331926819."), false);
  assert.equal(isValidIbanChecksum("GB29NWBK_0161331926819"), false);
  assert.equal(isValidIbanChecksum("GB29NWBK6016133192681é"), false);
});

test("wrong shape fails even with a lucky checksum", () => {
  assert.equal(isValidIbanChecksum("1229NWBK60161331926819"), false);
  assert.equal(isValidIbanChecksum("GBXXNWBK60161331926819"), false);
});

test("non-strings return false instead of throwing", () => {
  for (const value of [null, undefined, 123, {}, []]) {
    assert.equal(isValidIbanChecksum(value), false);
  }
});

test("normalizeIban", () => {
  assert.equal(normalizeIban(" gb29 nwbk-6016 1331	9268 19 "), "GB29NWBK60161331926819");
  assert.equal(normalizeIban(""), "");
  assert.throws(() => normalizeIban(42), TypeError);
});

test("formatIban", () => {
  assert.equal(formatIban("gb29nwbk60161331926819"), "GB29 NWBK 6016 1331 9268 19");
  assert.equal(formatIban("NL91ABNA0417164300"), "NL91 ABNA 0417 1643 00");
  assert.equal(formatIban(""), "");
  assert.throws(() => formatIban(null), TypeError);
});

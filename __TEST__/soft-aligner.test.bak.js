/**
 * @jest-environment jsdom
 * 
 */

const { test } = require("@jest/globals");
const { diffView } = require("../diffview");


test("Test 1 - one two three --> four two six", () => {

  const baseObj = [{text: "one", start: 1000, end: 1501},{text: "two", start: 2000, end: 2502},{text: "three", start: 3000, end: 3503}];

  const newTxt = "four two six";

  const expected = [
    {
      "text": "four",
      "start": 1000,
      "duration": 501,
      "end": 1501
    },
    {
      "text": "two",
      "start": 2000,
      "duration": 502,
      "end": 2502
    },
    {
      "text": "six",
      "start": 3000,
      "duration": 503,
      "end": 3503
    }
  ];

  expect(alignTranscript(baseObj, newTxt).toStrictEqual(expected));
});
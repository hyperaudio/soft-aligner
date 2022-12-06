/**
 * @jest-environment jsdom
 * 
 */

const { test } = require("@jest/globals");
const { diffview } = require("../diffview");
const { difflib } = require("../difflib");

console.log(difflib);

//useful functions

function createBaseText(words) {
  let output = "";
  words.forEach(word => {
    output+=word.text+" ";
  });
  return output.trim();
}

function sanitise(str) {
  return (str.replace(/ /g, "\n").replace(/\./g, "").replace(/,/g, "").replace(/’/g, "'").replace(/“/g, "").replace(/’/g, "”").toLowerCase());
}

test("Test 1 - one two three --> four two six", () => {

  const baseObj = [{text: "one", start: 1000, end: 1501},{text: "two", start: 2000, end: 2502},{text: "three", start: 3000, end: 3503}];

  const newTxt = "four two six";
  const baseTxt = createBaseText(baseObj);

  const newTxtInput = difflib.stringAsLines(sanitise(newTxt));
  const baseTxtInput = difflib.stringAsLines(sanitise(baseTxt));
  
  const input = {
    baseTextLines: baseTxtInput,
    newTextLines: newTxtInput,
    opcodes: new difflib.SequenceMatcher(baseTxtInput, newTxtInput).get_opcodes(),
    baseTextName: "Test Base Text",
    newTextName: "Test New Text",
    contextSize: "",
    viewType: 0,
    pass: true,
    baseObject : baseObj,
    newText: newTxt,
    boundaryStart: 9000,
    boundaryEnd: 20000
  };

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

  expect(diffview.buildView(input).data).toStrictEqual(expected);
});

test("Test 2 - a big hello from a bag four three --> hello from a large bag for free", () => {

  const baseObj = [{text: "a", start: 1000, end: 1501},{text: "big", start: 2000, end: 2502},{text: "hello", start: 3000, end: 3503},{text: "from", start: 4000, end: 4504},{text: "a", start: 5000, end: 5505},{text: "bag", start: 6000, end: 6506}, {text: "four", start: 7000, end: 7507}, {text: "three", start: 8000, end: 8508}];

  const newTxt = "hello from a large bag for free";
  const baseTxt = createBaseText(baseObj);

  const newTxtInput = difflib.stringAsLines(sanitise(newTxt));
  const baseTxtInput = difflib.stringAsLines(sanitise(baseTxt));
  
  const input = {
    baseTextLines: baseTxtInput,
    newTextLines: newTxtInput,
    opcodes: new difflib.SequenceMatcher(baseTxtInput, newTxtInput).get_opcodes(),
    baseTextName: "Test Base Text",
    newTextName: "Test New Text",
    contextSize: "",
    viewType: 0,
    pass: true,
    baseObject : baseObj,
    newText: newTxt,
    boundaryStart: 9000,
    boundaryEnd: 20000
  };

  const expected = [
    {
      "text": "hello",
      "start": 3000,
      "duration": 503,
      "end": 3503
    },
    {
      "text": "from",
      "start": 4000,
      "duration": 504,
      "end": 4504
    },
    {
      "text": "a",
      "start": 5000,
      "duration": 505,
      "end": 5505
    },
    {
      "text": "large",
      "start": 5506,
      "duration": 493,
      "end": 5999
    },
    {
      "text": "bag",
      "start": 6000,
      "duration": 506,
      "end": 6506
    },
    {
      "text": "for",
      "start": 7000,
      "duration": 507,
      "end": 7507
    },
    {
      "text": "free",
      "start": 8000,
      "duration": 508,
      "end": 8508
    }
  ];

  expect(diffview.buildView(input).data).toStrictEqual(expected);
});


test("Test 3 - I am a vole and I eat in a hole yeah --> Hey, I am a lonely vole and I like to eat in a bowl", () => {

  const baseObj = [{text: "I", start: 1000, end: 1501},{text: "am", start: 2000, end: 2502},{text: "a", start: 3000, end: 3503},{text: "vole", start: 4000, end: 4504},{text: "and", start: 5000, end: 5505},{text: "I", start: 6000, end: 6506}, {text: "eat", start: 7000, end: 7507}, {text: "in", start: 8000, end: 8508}, {text: "a", start: 9000, end: 9509}, {text: "hole", start: 10000, end: 10510}, {text: "yeah", start: 11000, end: 11511}];

  const newTxt = "Hey, I am a lonely vole and I like to eat in a bowl";
  const baseTxt = createBaseText(baseObj);

  const newTxtInput = difflib.stringAsLines(sanitise(newTxt));
  const baseTxtInput = difflib.stringAsLines(sanitise(baseTxt));
  
  const input = {
    baseTextLines: baseTxtInput,
    newTextLines: newTxtInput,
    opcodes: new difflib.SequenceMatcher(baseTxtInput, newTxtInput).get_opcodes(),
    baseTextName: "Test Base Text",
    newTextName: "Test New Text",
    contextSize: "",
    viewType: 0,
    pass: true,
    baseObject : baseObj,
    newText: newTxt,
    boundaryStart: 30,
    boundaryEnd: 12000
  };

  const expected = [
    {
      "text": "hey",
      "start": 31,
      "duration": 968,
      "end": 999
    },
    {
      "text": "i",
      "start": 1000,
      "duration": 501,
      "end": 1501
    },
    {
      "text": "am",
      "start": 2000,
      "duration": 502,
      "end": 2502
    },
    {
      "text": "a",
      "start": 3000,
      "duration": 503,
      "end": 3503
    },
    {
      "text": "lonely",
      "start": 3504,
      "duration": 495,
      "end": 3999
    },
    {
      "text": "vole",
      "start": 4000,
      "duration": 504,
      "end": 4504
    },
    {
      "text": "and",
      "start": 5000,
      "duration": 505,
      "end": 5505
    },
    {
      "text": "i",
      "start": 6000,
      "duration": 506,
      "end": 6506
    },
    {
      "text": "like",
      "start": 6507,
      "duration": 327,
      "end": 6834
    },
    {
      "text": "to",
      "start": 6835,
      "duration": 162,
      "end": 6997
    },
    {
      "text": "eat",
      "start": 7000,
      "duration": 507,
      "end": 7507
    },
    {
      "text": "in",
      "start": 8000,
      "duration": 508,
      "end": 8508
    },
    {
      "text": "a",
      "start": 9000,
      "duration": 509,
      "end": 9509
    },
    {
      "text": "bowl",
      "start": 10000,
      "duration": 510,
      "end": 10510
    }
  ];

  expect(diffview.buildView(input).data).toStrictEqual(expected);
});

test("Test 4 - Hey, I am a fat mole and I like to live in a hole! --> Hey, I am a fat mole and I like to live in a hole!", () => {

  const baseObj = [{text: "I", start: 10000, end: 10500},{text: "am", start: 11000, end: 11500},{text: "a", start: 12000, end: 12500},{text: "mole", start: 13000, end: 13500},{text: "and", start: 14000, end: 14500},{text: "I", start: 15000, end: 15500},{text: "live", start: 16000, end: 16500}, {text: "in", start: 17000, end: 17500}, {text: "a", start: 18000, end: 18500}, {text: "hole", start: 19000, end: 19500}];

  const newTxt = "Hey, I am a fat mole and I like to live in a hole!";
  const baseTxt = createBaseText(baseObj);

  const newTxtInput = difflib.stringAsLines(sanitise(newTxt));
  const baseTxtInput = difflib.stringAsLines(sanitise(baseTxt));
  
  const input = {
    baseTextLines: baseTxtInput,
    newTextLines: newTxtInput,
    opcodes: new difflib.SequenceMatcher(baseTxtInput, newTxtInput).get_opcodes(),
    baseTextName: "Test Base Text",
    newTextName: "Test New Text",
    contextSize: "",
    viewType: 0,
    pass: true,
    baseObject : baseObj,
    newText: newTxt,
    boundaryStart: 9000,
    boundaryEnd: 20000
  };

  const expected = [
    {
      "text": "hey",
      "start": 9001,
      "duration": 998,
      "end": 9999
    },
    {
      "text": "i",
      "start": 10000,
      "duration": 500,
      "end": 10500
    },
    {
      "text": "am",
      "start": 11000,
      "duration": 500,
      "end": 11500
    },
    {
      "text": "a",
      "start": 12000,
      "duration": 500,
      "end": 12500
    },
    {
      "text": "fat",
      "start": 12501,
      "duration": 498,
      "end": 12999
    },
    {
      "text": "mole",
      "start": 13000,
      "duration": 500,
      "end": 13500
    },
    {
      "text": "and",
      "start": 14000,
      "duration": 500,
      "end": 14500
    },
    {
      "text": "i",
      "start": 15000,
      "duration": 500,
      "end": 15500
    },
    {
      "text": "like",
      "start": 15501,
      "duration": 331,
      "end": 15832
    },
    {
      "text": "to",
      "start": 15833,
      "duration": 164,
      "end": 15997
    },
    {
      "text": "live",
      "start": 16000,
      "duration": 500,
      "end": 16500
    },
    {
      "text": "in",
      "start": 17000,
      "duration": 500,
      "end": 17500
    },
    {
      "text": "a",
      "start": 18000,
      "duration": 500,
      "end": 18500
    },
    {
      "text": "hole",
      "start": 19000,
      "duration": 500,
      "end": 19500
    }
  ];

  expect(diffview.buildView(input).data).toStrictEqual(expected);
});

test("Test 5 - The big red green brown fox jumped over the rolling log. --> ok The brown spotted a snow fox leaped high over the fat rolling chocolate log slice.", () => {

  const baseObj = [{text: "The", start: 1000, end: 1501},{text: "big", start: 2000, end: 2502},{text: "red", start: 3000, end: 3503},{text: "green", start: 4000, end: 4504},{text: "brown", start: 5000, end: 5505},{text: "fox", start: 6000, end: 6506},{text: "jumped", start: 7000, end: 7507}, {text: "over", start: 8000, end: 8508}, {text: "the", start: 9000, end: 9509}, {text: "rolling", start: 10000, end: 10510}, {text: "log", start: 11000, end: 11511}];

  const newTxt = "ok The brown spotted a snow fox leaped high over the fat rolling chocolate log slice.";
  const baseTxt = createBaseText(baseObj);

  const newTxtInput = difflib.stringAsLines(sanitise(newTxt));
  const baseTxtInput = difflib.stringAsLines(sanitise(baseTxt));
  
  const input = {
    baseTextLines: baseTxtInput,
    newTextLines: newTxtInput,
    opcodes: new difflib.SequenceMatcher(baseTxtInput, newTxtInput).get_opcodes(),
    baseTextName: "Test Base Text",
    newTextName: "Test New Text",
    contextSize: "",
    viewType: 0,
    pass: true,
    baseObject : baseObj,
    newText: newTxt,
    boundaryStart: 30,
    boundaryEnd: 13000
  };

  const expected = [
    {
      "text": "ok",
      "start": 31,
      "duration": 968,
      "end": 999
    },
    {
      "text": "the",
      "start": 1000,
      "duration": 501,
      "end": 1501
    },
    {
      "text": "brown",
      "start": 5000,
      "duration": 505,
      "end": 5505
    },
    {
      "text": "spotted",
      "start": 5506,
      "duration": 286,
      "end": 5792
    },
    {
      "text": "a",
      "start": 5793,
      "duration": 39,
      "end": 5832
    },
    {
      "text": "snow",
      "start": 5833,
      "duration": 163,
      "end": 5996
    },
    {
      "text": "fox",
      "start": 6000,
      "duration": 506,
      "end": 6506
    },
    {
      "text": "leaped",
      "start": 7000,
      "duration": 599,
      "end": 7599
    },
    {
      "text": "high",
      "start": 7600,
      "duration": 399,
      "end": 7999
    },
    {
      "text": "over",
      "start": 8000,
      "duration": 508,
      "end": 8508
    },
    {
      "text": "the",
      "start": 9000,
      "duration": 509,
      "end": 9509
    },
    {
      "text": "fat",
      "start": 9510,
      "duration": 489,
      "end": 9999
    },
    {
      "text": "rolling",
      "start": 10000,
      "duration": 510,
      "end": 10510
    },
    {
      "text": "chocolate",
      "start": 10511,
      "duration": 488,
      "end": 10999
    },
    {
      "text": "log",
      "start": 11000,
      "duration": 511,
      "end": 11511
    },
    {
      "text": "slice",
      "start": 11512,
      "duration": 1488,
      "end": 13000
    }
  ];

  expect(diffview.buildView(input).data).toStrictEqual(expected);
});
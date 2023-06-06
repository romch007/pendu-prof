const fs = require("fs");
const url = require("url");

const goodWords = loadGoodWords();
let wordToGuess;
let nbErrors = 0;
let maxErrors = 5;
let partialWord = [];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  const index = getRandomInt(0, arr.length - 1);
  return arr[index];
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function generateTestLetterResponse(wasGuessed) {
  return JSON.stringify({
    nbErrors,
    partialWord,
    wasGuessed,
    isLoss: nbErrors >= maxErrors,
  });
}

function manageRequest(request, response) {
  const path = url.parse(request.url);
  if (path.pathname === "/api/getWord") {
    response.statusCode = 200;
    response.end(getRandomElement(goodWords));
  } else if (path.pathname === "/api/newGame") {
    wordToGuess = getRandomElement(goodWords);
    console.log(wordToGuess);
    const wordLength = wordToGuess.length;

    partialWord = Array(wordLength).fill("_");

    response.end(wordLength.toString());
    response.statusCode = 200;
  } else if (path.pathname === "/api/testLetter") {
    if (!wordToGuess) {
      response.statusCode = 403;
      response.end("Game is not started");
      return;
    }

    const params = new URLSearchParams(path.search);
    const letter = params.get("letter");

    if (!isLetter(letter)) {
      response.statusCode = 403;
      response.end("This is not a letter");
      return;
    }

    let wasGuessed = false;

    console.log(wordToGuess);

    [...wordToGuess].forEach((l, i) => {
      if (l == letter) {
        partialWord[i] = l;
        wasGuessed = true;
      }
    });

    if (!wasGuessed) nbErrors++;

    response.end(generateTestLetterResponse(wasGuessed));
  } else {
    response.statusCode = 404;
    response.end();
  }
}

function validateWord(word) {
  for (let i = 0; i < word.length; i++) {
    if (word.charCodeAt(i) < 97 || word.charCodeAt(i) > 122) {
      return false;
    }
  }

  return word.length >= 6 && word.length <= 8;
}

function loadGoodWords() {
  console.log("Loading dictionnary...");
  let content = fs.readFileSync("book.txt", { encoding: "utf8" });
  content = content.split(/[(\r?\n),. ]+/);
  const goodWords = content.filter(validateWord);
  return goodWords;
}

module.exports = { manageRequest };

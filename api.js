const fs = require("fs");
const cookie = require("cookie");
const url = require("url");
const crypto = require("crypto");

const goodWords = loadGoodWords();

const games = new Map();

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

function generateSessionId() {
  return crypto.randomBytes(10).toString("hex");
}

class Game {
  constructor() {
    this.wordToGuess = getRandomElement(goodWords);
    this.wordLength = this.wordToGuess.length;
    this.partialWord = Array(this.wordLength).fill("_");
    this.nbErrors = 0;
    this.maxErrors = 5;
    this.wasGuessed = false;
  }

  testLetter(letter) {
    let wasGuessed = false;

    console.log(this.wordToGuess);

    [...this.wordToGuess].forEach((l, i) => {
      if (l == letter) {
        this.partialWord[i] = l;
        this.wasGuessed = true;
      }
    });

    if (!this.wasGuessed) this.nbErrors++;
  }

  toResponse() {
    return JSON.stringify({
      nbErrors: this.nbErrors,
      partialWord: this.partialWord,
      wasGuessed: this.wasGuessed,
      isLoss: this.nbErrors >= this.maxErrors,
    });
  }
}

function manageRequest(request, response) {
  const path = url.parse(request.url);
  if (path.pathname === "/api/getWord") {
    response.statusCode = 200;
    response.end(getRandomElement(goodWords));
  } else if (path.pathname === "/api/newGame") {
    const sessionId = generateSessionId();

    response.setHeader("Set-Cookie", cookie.serialize("session", sessionId));

    const game = new Game();
    games.set(sessionId, game);

    response.end(game.wordLength.toString());
    response.statusCode = 200;
  } else if (path.pathname === "/api/testLetter") {
    const rawCookies = request.headers["cookie"];

    if (!rawCookies) {
      response.statusCode = 403;
      response.end("No cookies!");
      return;
    }

    const cookies = cookie.parse(rawCookies);

    if (!cookies.session) {
      response.statusCode = 403;
      response.end("No cookie session!");
      return;
    }

    const sessionId = cookies.session;

    if (!games.has(sessionId)) {
      response.statusCode = 403;
      response.end("Game is not started!");
      return;
    }

    const game = games.get(sessionId);

    const params = new URLSearchParams(path.search);
    const letter = params.get("letter");

    if (!isLetter(letter)) {
      response.statusCode = 403;
      response.end("This is not a letter");
      return;
    }

    game.testLetter(letter);

    response.end(game.toResponse());
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

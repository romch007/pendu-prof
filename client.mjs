import axios from "axios";
import chalk from "chalk";
import prompts from "prompts";

const BASE_URL = "http://localhost:8080/api";

const client = axios.create({
  baseURL: BASE_URL,
});

let partialWord;

async function play() {
  console.log(chalk.bold("Welcome to CLI hangman"));

  const newGameResponse = await client.post("/newGame");
  console.log(chalk.green("New game created!"));
  const wordLength = parseInt(newGameResponse.data);
  const cookies = newGameResponse.headers.get("set-cookie");
  client.defaults.headers["cookie"] = cookies;

  let isLost = false;
  let isWon = false;

  partialWord = Array(wordLength).fill("_");

  do {
    displayWord();
    const letter = await askLetter();
    const guessLetterResponse = await client.post(
      `/testLetter?letter=${letter}`
    );

    console.log(guessLetterResponse.data);

    const isGuessed = guessLetterResponse.data.wasGuessed;

    partialWord = guessLetterResponse.data.partialWord;
    isLost = guessLetterResponse.data.isLost;
    isWon = guessLetterResponse.data.isWon;

    if (!isGuessed) console.log(chalk.red("Wrong letter!"));
  } while (!isLost && !isWon);

  if (isLost) {
    console.log(chalk.red.bold("You lost! :("));
  } else {
    console.log(chalk.green.bold("You won! :)"));
  }
}

async function askLetter() {
  const response = await prompts({
    type: "text",
    name: "letter",
    message: "Letter to test",
    validate: (value) => (value.length != 1 ? "This is not a letter" : true),
  });

  return response.letter;
}

function displayWord() {
  console.log(chalk.bold(partialWord.join(" ")));
}

play().catch((e) => {
  console.log(chalk.red(`Got error: ${e.code ?? e.message}`));
});



// written by Yaseen

let selectedCard = null;

function showCardSelection(event) {
  const cardList = generateCardList();
  const currentCell = event.target;
  cardList.style.position = "absolute";
  cardList.style.top = `${event.clientY}px`;
  cardList.style.left = `${event.clientX}px`;
  document.body.appendChild(cardList);

  cardList.addEventListener("click", function (cardEvent) {
    const selectedCardValue = cardEvent.target.textContent;
    placeOrReplaceCard(currentCell, selectedCardValue);
    document.body.removeChild(cardList);
  });
}

function generateCardList() {
  const cardList = document.createElement("div");
  cardList.classList.add("card-list-grid");

  const suits = ["d", "h", "s", "c"];
  const suitNames = {
    d: "Diamonds",
    h: "Hearts",
    s: "Spades",
    c: "Clubs",
  };
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  suits.forEach((suit) => {
    const column = document.createElement("div");
    column.classList.add("card-column");

    const suitHeader = document.createElement("div");
    suitHeader.textContent = suitNames[suit];
    suitHeader.classList.add("suit-header");
    column.appendChild(suitHeader);

    ranks.forEach((rank) => {
      const card = document.createElement("div");
      card.textContent = rank + suit;
      card.classList.add("card-option");
      if (suit === "d" || suit === "h") {
        card.classList.add("red");
      } else {
        card.classList.add("black");
      }
      column.appendChild(card);
    });

    cardList.appendChild(column);
  });

  return cardList;
}

function placeOrReplaceCard(target, selectedCardValue) {
  target.textContent = selectedCardValue;

  if (selectedCardValue.endsWith("d") || selectedCardValue.endsWith("h")) {
    target.classList.add("red");
    target.classList.remove("black");
  } else {
    target.classList.add("black");
    target.classList.remove("red");
  }
}

document.querySelectorAll("#hand .card").forEach((card) => {
  card.addEventListener("click", showCardSelection);
});

document.querySelectorAll("#grid .cell").forEach((cell) => {
  cell.addEventListener("click", showCardSelection);
});

// calculations for each cell
function getHoveredCard() {
  const handCards = document.querySelectorAll("#hand .card");

  handCards.forEach((card) => {
    card.addEventListener("mouseover", (event) => {
      const cardText = event.target.textContent;
      calculatePointsOnEachCell(cardText);
    });

    card.addEventListener("mouseout", () => {
      clearAllCells();
    });
  });
}

function calculatePointsOnEachCell(cardText) {
  const gridCells = document.querySelectorAll("#grid .cell");

  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from(gridCells).slice(row * 8, row * 8 + 8)
  );

  gridCells.forEach((cell, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    let points = 0;
    let combo = 0;

    const directions = [
      "top",
      "bottom",
      "left",
      "right",
      "topRight",
      "topLeft",
      "bottomRight",
      "bottomLeft",
      "verticalMid",
      "horizontalMid",
      "slash",
      "backSlash",
    ];
    if (/[a-zA-Z]/.test(cell.textContent)) {
      return;
    }
    directions.forEach((direction) => {
      const [text1, text2] = getTextContentsForDirection(
        grid,
        row,
        col,
        direction
      );

      if (isValidText(text1, text2, cardText)) {
        const directionPoints = calculatePointsForTexts(text1, text2, cardText);
        if (directionPoints > 0) combo++;

        points += directionPoints;
      }
    });

    cell.textContent = points > 0 ? points * combo : "0";
    // indicates that this cells has combo points
    if (combo > 1) cell.textContent += "+";
  });
}

function getTextContentsForDirection(grid, row, col, direction) {
  const directions = {
    top: [-1, 0],
    bottom: [1, 0],
    left: [0, -1],
    right: [0, 1],
    topRight: [-1, 1],
    topLeft: [-1, -1],
    bottomRight: [1, 1],
    bottomLeft: [1, -1],
    verticalMid: [-1, 0, 1, 0],
    horizontalMid: [0, -1, 0, 1],
    slash: [-1, 1, 1, -1],
    backSlash: [1, 1, -1, -1],
  };

  const offsets = directions[direction];

  if (!offsets) {
    console.error("Invalid direction:", direction);
    return ["0", "0"];
  }

  const texts = [];
  if (direction === "verticalMid") {
    texts.push(
      grid[row - 1] && grid[row - 1][col]
        ? grid[row - 1][col].textContent
        : "0",
      grid[row + 1] && grid[row + 1][col] ? grid[row + 1][col].textContent : "0"
    );
  } else if (direction === "horizontalMid") {
    texts.push(
      grid[row][col - 1] ? grid[row][col - 1].textContent : "0",
      grid[row][col + 1] ? grid[row][col + 1].textContent : "0"
    );
  } else if (direction === "slash") {
    texts.push(
      grid[row - 1] && grid[row - 1][col + 1]
        ? grid[row - 1][col + 1].textContent
        : "0",
      grid[row + 1] && grid[row + 1][col - 1]
        ? grid[row + 1][col - 1].textContent
        : "0"
    );
  } else if (direction === "backSlash") {
    texts.push(
      grid[row + 1] && grid[row + 1][col + 1]
        ? grid[row + 1][col + 1].textContent
        : "0",
      grid[row - 1] && grid[row - 1][col - 1]
        ? grid[row - 1][col - 1].textContent
        : "0"
    );
  } else {
    const [rowOffset, colOffset] = directions[direction];

    const texts = [
      grid[row + rowOffset] && grid[row + rowOffset][col + colOffset],
      grid[row + 2 * rowOffset] &&
        grid[row + 2 * rowOffset][col + 2 * colOffset],
    ].map((cell) => (cell ? cell.textContent : "0"));

    return texts;
  }

  return texts;
}

function calculatePointsForTexts(text1, text2, text3) {
  let points = 0;

  const firstLetters = [text1[0], text2[0], text3[0]];
  const secondLetters = [text1[1], text2[1], text3[1]];

  if (firstLetters.some((letter) => letter === undefined)) return points;

  const firstLetterValues = firstLetters.map((letter) => {
    switch (letter) {
      case "A":
        return 1;
      case "J":
        return 11;
      case "Q":
        return 12;
      case "K":
        return 13;
      default:
        return parseInt(letter, 10);
    }
  });

  const sortedValues = firstLetterValues.sort((a, b) => a - b);
  const isConsecutive =
    sortedValues[2] - sortedValues[1] === 1 &&
    sortedValues[1] - sortedValues[0] === 1;
  // trio
  if (new Set(firstLetters).size === 1) {
    points += 100;
  }
  // pure consecutive
  else if (isConsecutive && new Set(secondLetters).size === 1) {
    points += 60;
  }
  // consecutive
  else if (isConsecutive) {
    points += 40;
  }
  // color
  else if (new Set(secondLetters).size === 1) {
    points += 20;
  }
  // pair
  else if (new Set(firstLetters).size <= 2) {
    points += 10;
  }
  return points;
}

function isValidText(text1, text2, text3) {
  return (
    /[a-zA-Z]/.test(text1) && /[a-zA-Z]/.test(text2) && /[a-zA-Z]/.test(text3)
  );
}

function clearAllCells() {
  const gridCells = document.querySelectorAll("#grid .cell");

  gridCells.forEach((cell) => {
    const cellText = cell.textContent;

    if (!/[a-zA-Z]/.test(cellText)) {
      cell.textContent = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", getHoveredCard);

export const transformText = (inputText: string, words: string[]) => {
  let transformedText = '';
  let currentIndex = 0;

  while (currentIndex < inputText.length) {
    let found = false;

    // Sort words by length in descending order to prioritize longer phrases
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const phrase of sortedWords) {
      // Check if the current segment of text starts with the phrase
      if (inputText.slice(currentIndex).toLowerCase().startsWith(phrase.toLowerCase())) {
        // Transform the phrase to uppercase and apply bold style
        transformedText += `<strong style="text-transform: uppercase">${inputText.slice(currentIndex, currentIndex + phrase.length)}</strong>`;
        currentIndex += phrase.length;
        found = true;
        break; // Break after the first match to avoid overlapping transformations
      }
    }

    // If no matching phrase is found, move to the next character
    if (!found) {
      transformedText += inputText[currentIndex];
      currentIndex++;
    }
  }

  return transformedText;
};

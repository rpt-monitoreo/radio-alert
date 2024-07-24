import { Transcription } from '../entities/transcription.entity';
import nlp from 'compromise';

function mergeOverlappingTexts(textSegmentsIn: Transcription[], words: string[]): string {
  const texts = textSegmentsIn
    .filter(transcription => !transcription.text.includes('Música-NoEspañol.'))
    .map(transcription => {
      const words = transcription.text.split(' ');
      return { ...transcription, text: words.join(' ').toLowerCase().trim() };
    });
  const textSegments = swapIfFirst20CharsMatchAnywhere(texts);
  let mergedText = textSegments[0].text; // Inicia con el texto del primer segmento

  for (let i = 1; i < textSegments.length; i++) {
    const currentText = mergedText;
    const nextTextSegment = textSegments[i];
    const overlapStartIndex = nextTextSegment.text.indexOf(currentText.slice(-20)); // Busca una parte del final del texto actual en el siguiente segmento

    if (overlapStartIndex > -1) {
      // Si hay sobreposición, combina los textos eliminando la parte repetida
      const nonOverlappingPart = nextTextSegment.text.slice(overlapStartIndex + 20);
      mergedText += nonOverlappingPart;
    } else {
      // Si no hay sobreposición, simplemente concatena los textos
      mergedText += ' ' + nextTextSegment.text;
    }
  }
  const textNoDuplicated = eliminarFrasesRepetidas(mergedText);

  return recortarTexto(textNoDuplicated, words, 1000);
}

function recortarTexto(text: string, phrases: string[], maxWords: number): string {
  const textArray = text.split(' ');
  const textLower = text.toLowerCase();
  const phraseIndices = phrases.flatMap(phrase => {
    const indices = [];
    let startIndex = 0;
    const phraseLower = phrase.toLowerCase();
    while ((startIndex = textLower.indexOf(phraseLower, startIndex)) !== -1) {
      const wordIndex = textLower.slice(0, startIndex).split(' ').length - 1;
      indices.push(wordIndex);
      startIndex += phraseLower.length;
    }
    return indices;
  });

  if (phraseIndices.length === 0) {
    return textArray.slice(0, maxWords).join(' ');
  }

  const minIndex = Math.min(...phraseIndices);
  const maxIndex = Math.max(...phraseIndices);

  const betweenIndex = maxIndex - minIndex;
  let sideGap = 0;
  if (betweenIndex === 0) sideGap = maxWords / 2;
  if (betweenIndex >= maxWords * 0.9) sideGap = maxWords * 0.1;
  if (betweenIndex < maxWords * 0.9) sideGap = (maxWords - betweenIndex) / 2;

  const start = Math.max(0, minIndex - sideGap);
  const end = Math.min(textArray.length, maxIndex + sideGap);

  return textArray.slice(start, end).join(' ');
}

function swapIfFirst20CharsMatchAnywhere(segments: Transcription[]): Transcription[] {
  for (let i = 0; i < segments.length - 1; i++) {
    const currentText = segments[i].text;
    const nextText = segments[i + 1].text;
    const first20Chars = currentText.substring(0, 20);

    if (nextText.includes(first20Chars)) {
      // Swap positions
      [segments[i], segments[i + 1]] = [segments[i + 1], segments[i]];
    }
  }
  return segments;
}

function eliminarFrasesRepetidas(texto: string): string {
  const doc = nlp(texto);
  const frases = doc.sentences().out('array');
  const frasesUnicas: string[] = [];
  const frasesVistas = new Set<string>();

  frases.forEach(frase => {
    if (!frasesVistas.has(frase)) {
      frasesUnicas.push(frase);
      frasesVistas.add(frase);
    }
  });

  return frasesUnicas.join(' ');
}
export default mergeOverlappingTexts;


export const defaultGetRows = (movetext, newlineChar) => { // eslint-diable-line no-unused-vars
  newlineChar;
  let ms = movetext;
  if (!ms) {
    return [];
  }
  /* delete comments */
  ms = ms.replace(/(\{[^}]+\})+?/g, '');

  /* delete recursive annotation variations */
  const ravRegex = /(\([^\(\)]+\))+?/g;
  while (ravRegex.test(ms)) {
    ms = ms.replace(ravRegex, '');
  }

  /* delete numeric annotation glyphs */
  ms = ms.replace(/\$\d+/g, '');

  /* Delete result */
  ms = ms.replace(/(?:1-0|0-1|1\/2-1\/2|\*)$/, '');

  /* Delete any double spaces */
  ms = ms.replace(/\s\s/g, ' ').trim();

  /* Split into rows */
  const rows = [];
  const rowRegex = /\d+\.\s?\S+(?:\s+\S+)?/g;
  while (true) {
    const result = rowRegex.exec(ms);
    if (!result) {break;}
    const row = result[0].split(/\s|\.\s?/g);
    row[0] = parseInt(row[0]);
    rows.push(row);
  }
  return rows;
};

export const calculateMoveNumber = (number, isBlack) => 1 + ((number - 1) * 2 + isBlack);

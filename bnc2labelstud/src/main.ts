import { JSDOM } from "jsdom";

const getBNChtml = async (bncId: string) => {
  return fetch(`http://bnc.phon.ox.ac.uk/transcripts-html/${bncId}.html`, {})
    .then((response) => response.text())
    .then((html) => new JSDOM(html).window.document)
    .then((doc) => doc.querySelectorAll("table:not(.dramper)"))
    .then((dialogs) => {
      let parsedDialogues = [];
      for (const d of dialogs) {
        let parsedDialogue = [];
        const lines = d
          .getElementsByTagName("tbody")[0]
          .getElementsByTagName("tr");
        for (const line of lines) {
          let speaker = line
            .getElementsByTagName("td")[0]
            .textContent.replace(/\n/g, "")
            .replace(/\s+/g, " ")
            .trim();
          let turnsAndUtterances = line
            .getElementsByTagName("td")[1]
            .innerHTML.replace(/\n/g, "")
            .replace(/\s+/g, " ")
            .split("<br>");
          // .slice(0, -1);

          // console.log(turnsAndUtterances);
          for (const turn of turnsAndUtterances) {
            if (!!turn) {
              parsedDialogue.push({
                speaker: speaker,
                turnNumber: turn.match(/\s\[(\d+)\]/)
                  ? turn.match(/\s\[(\d+)\]/)[1]
                  : "NA",
                utterance: turn.replace(/\s\[\d+\]/, "").trim(),
              });
            }
          }
        }
        parsedDialogues.push(parsedDialogue);
      }
      return parsedDialogues.flat();
    });
};

const dial = async () => {
  const bncId = process.argv[3];
  const dialog = await getBNChtml(bncId);
  const target = process.argv[4],
    before = 20,
    after = 20;
  const targetIndex = dialog.findIndex((a) => a.turnNumber == target);
  const subdialog = dialog.slice(
    targetIndex - before >= 0 ? targetIndex - before : 0,
    targetIndex + after,
  );
  // console.log(subdialog);
  const basicLabelstudJSON = {
    dialogue: [],
    id: bncId,
    targetTurn: target,
    firstTurn:
      dialog[targetIndex - before >= 0 ? targetIndex - before : 0].turnNumber,
  };
  basicLabelstudJSON.dialogue = subdialog.map(
    ({ speaker, turnNumber, utterance }) => ({
      author: `${speaker}`,
      text: utterance,
    }),
  );

  console.log(JSON.stringify(basicLabelstudJSON));
};

dial();

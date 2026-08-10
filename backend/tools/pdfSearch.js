const {
  answerFromDocument,
} = require("../rag/answerFromDocument");

async function pdfSearch(
  question
) {
  return await answerFromDocument(
    question
  );
}

module.exports = {
  pdfSearch,
};
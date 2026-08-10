const client =
  require("./chromaClient");

async function getDocumentCollection() {

  const collection =
    await client.getOrCreateCollection({
      name: "documents",
    });

  return collection;
}

module.exports = {
  getDocumentCollection,
};
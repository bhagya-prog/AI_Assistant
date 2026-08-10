const client =
  require("./chromaClient");

async function getMemoryCollection() {

  const collection =
    await client.getOrCreateCollection({
      name: "memories",
    });

  return collection;
}

module.exports = {
  getMemoryCollection,
};
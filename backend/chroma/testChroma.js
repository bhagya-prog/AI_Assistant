const {
  getMemoryCollection,
} = require(
  "./memoryCollection"
);

async function run() {

  const collection =
    await getMemoryCollection();

  console.log(
    "Collection Created:",
    collection.name
  );

}

run();
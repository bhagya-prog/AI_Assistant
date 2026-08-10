const {
  getProfile,
  saveProfile,
} = require("./profileManager");

function updateProfile(text) {

  const profile =
    getProfile();

  const lower = text.toLowerCase();
  if (!Array.isArray(profile.likes)) {
    profile.likes = [];
  }

  if (
    lower.includes("my name is")
  ) {

    const nameMatch = text.match(/my name is\s+(.+)/i);
    profile.name = nameMatch?.[1]?.trim() || profile.name;
  }

  if (
    lower.includes(
      "favorite language is"
    )
  ) {

    const languageMatch = text.match(/favorite language is\s+(.+)/i);
    profile.favorite_language =
      languageMatch?.[1]?.trim() || profile.favorite_language;
  }

  if (
    lower.includes("i love")
  ) {

    const hobbyMatch = text.match(/i love\s+(.+)/i);
    const hobby = hobbyMatch?.[1]?.trim();

    if (
      hobby &&
      !profile.likes.includes(
        hobby
      )
    ) {

      profile.likes.push(
        hobby
      );
    }
  }

  saveProfile(profile);
}

module.exports = {
  updateProfile,
};
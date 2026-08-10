const fs = require("fs");
const path = require("path");

const profilePath = path.join(
  __dirname,
  "profile.json"
);

function getProfile() {
  if (!fs.existsSync(profilePath)) {
    const defaultProfile = {
      name: null,
      favorite_language: null,
      goal: null,
      likes: [],
    };
    saveProfile(defaultProfile);
    return defaultProfile;
  }

  const data =
    fs.readFileSync(
      profilePath,
      "utf8"
    );

  return JSON.parse(data);
}

function saveProfile(profile) {

  fs.writeFileSync(
    profilePath,
    JSON.stringify(
      profile,
      null,
      2
    )
  );
}

module.exports = {
  getProfile,
  saveProfile,
};
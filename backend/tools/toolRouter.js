const {
  calculate,
} = require("./calculator");

const {
  getCurrentTime,
} = require("./getTime");

const {
  getGoals,
} = require("./getGoals");

function detectTool(message) {

  const lower =
    message.toLowerCase();

  // Calculator

  if (
    /^[0-9+\-*/(). ]+$/
      .test(message)
  ) {

    return {
      tool: "calculator",
      result:
        calculate(message),
    };
  }

  // Time

  if (
    lower.includes("time")
  ) {

    return {
      tool: "time",
      result:
        getCurrentTime(),
    };
  }

  if (
    lower.startsWith("pdf:")
  ) {
    return {
      tool: "pdf",
      query: message.replace(
        "pdf:",
        ""
      )
    };
  }

  // Goals

  if (
    lower.includes("my goals")
  ) {

    return {
      tool: "goals",
      result:
        getGoals(),
    };
  }

  return null;
}

module.exports = {
  detectTool,
};
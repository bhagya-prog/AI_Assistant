function calculate(expression) {
  try {

    const result =
      Function(
        `"use strict";
         return (${expression})`
      )();

    return result;

  } catch {

    return "Invalid Expression";
  }
}

module.exports = {
  calculate,
};
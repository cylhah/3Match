const { watch } = require("gulp");
const { exec } = require("child_process");
function compile(cb) {
  let process = exec("layaair2-cmd compile");
  process.stdout.on("data", (data) => {
    console.log(data);
  });
  process.stderr.on("data", (data) => {
    console.log(data);
  });
  process.on("exit", (code, signal) => {
    console.log("success");
    console.log(code, signal);
    cb();
  });
}

function compileUI(cb) {
  let process = exec("layaair2-cmd ui -d");
  process.stdout.on("data", (data) => {
    console.log(data);
  });
  process.stderr.on("data", (data) => {
    console.log(data);
  });
  process.on("exit", (code, signal) => {
    console.log("success");
    console.log(code, signal);
    cb();
  });
}

exports.compile = compile;
exports.compileUI = compileUI
exports.default = function () {
  watch("src/**/*.*", compile);
  watch("laya/**/*.*", compileUI);
};

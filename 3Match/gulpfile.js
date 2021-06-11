const { watch } = require("gulp");
const { exec } = require("child_process");
function compile(cb) {
  //执行编译命令 layaair2-cmd compile
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

exports.compile = compile;
exports.default = function () {
  watch("src/**/*.*", { delay: 1000 }, compile);
};

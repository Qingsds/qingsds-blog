function echo(name, num) {
  console.log("Evaluating the " + name + " side");
  return num;
}
// 注意这里的幂运算符 (**)
console.log(echo("left", 2) ** echo("middle", 3) ** echo("right", 2));
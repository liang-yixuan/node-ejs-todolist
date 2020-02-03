const express = require("express");
const bodyParser = require("body-parser");
// 自己的function文件
const util = require(__dirname + "/util.js");

// 服务器发送ejs而不是html文件，要先创建views文件夹，并复制html代码到ejs文件中
const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

// 网页中会触发行为的placeholder，要设成global，因为get和post都要用到
let items = [];
let workItems = [];

// 每次来到home route都会触发一次get，req是客户端请求，res是服务器回应
app.get("/", function(req, res){
  let day = util.getDay();
  // 每次都要past所有的ejs variable
  res.render("list", {
    listTitle: day,
    itemsOfList : items
  });
});

// 我可以写无数个get来创建route，但是post只写一个，因为要对应html里的form
app.get("/work", function(req, res){
  res.render("list", {
    listTitle: "Work",
    itemsOfList : workItems
  });
});

// 处理网页中触发的行为，req是网页发送的信息，res是服务器动作
app.post("/", function(req, res){
  if (req.body.list === "Work"){
    item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
  } else {
    item = req.body.newItem;
    items.push(item);
    res.redirect("/");
  }
});

// 指定端口
app.listen(3000, function(){
  console.log("Server listening on port 3000")
});

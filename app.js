const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// 自己的function文件
const util = require(__dirname + "/util.js");

// 服务器发送ejs而不是html文件，要先创建views文件夹，并复制html代码到ejs文件中
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// 网页中会触发行为的placeholder，要设成global，因为get和post都要用到
// let items = [];
// let workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "null value occurred!"]
  }
});

const Item = mongoose.model("Item", itemSchema);


//
// const item2 = new Item({
//   name : "cook food"
// });
//
// const item3 = new Item({
//   name : "eat food"
// });
//
// const itemArray = [item1, item2, item3];

// Item.insertMany(itemArray, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Items inserted!");
//   }
// });



let items = [];




// 每次来到home route都会触发一次get，req是客户端请求，res是服务器回应
app.get("/", function(req, res) {
  let day = util.getDate();
  // 每次都要past所有的ejs variable
  res.render("list", {
    listTitle: day,
    itemsOfList: items
  });
});

const Work = mongoose.model("Work", itemSchema);
// Work.find(function(err, result){
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(result);
//     }
// });


const defaultItem = new Item({
  name: "Click + to add item"
});

app.get("/work", function(req, res) {
  Work.find(function(err, result) {
    console.log(result.length, " before insert");
    if (result.length === 0) {
      console.log("Empty list");
      Work.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("defaultItem inserted!");
        }
      });
      console.log(result.length, " after insert");
      res.redirect("/work");
    } else {
      workItems = result;
      res.render("list", {
        listTitle: "Work",
        itemsOfList: workItems
      });
    }
  });
});



app.post("/delete", function(req,res){

  const id = req.body.checkbox;
  Work.findByIdAndRemove({_id : id}, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("item deleted");
    }
  });
  res.redirect("/work");
})




// 处理网页中触发的行为，req是网页发送的信息，res是服务器动作
app.post("/", function(req, res) {
  if (req.body.list === "Work") {
    newItem = req.body.newItem;
    const currentItem = new Item({
      name: newItem
    });
    // currentItem.save();
    Work.insertMany(currentItem, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Items inserted!");
      }
    });
    res.redirect("/work");
  } else {
    item = req.body.newItem;
    items.push(item);
    res.redirect("/");
  }
});

// 指定端口
app.listen(3000, function() {
  console.log("Server listening on port 3000")
});

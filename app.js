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

// 总共只需一个collection，每个表有listName(string)，itemList(array);
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "null value occurred!"]
  }
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  listName: {
    type: String,
    createIndexes: {
      unique: true
    }
  },
  itemList: [itemSchema]
});
const List = mongoose.model("List", listSchema);


const defaultItem = new Item({
  name: "Click + to add item"
});
let items = [defaultItem];

// 每次来到home route都会触发一次get，req是客户端请求，res是服务器回应
// 设计home page展示所有的list，点击跳转list page
app.get("/", function(req, res) {
  let day = util.getDate();
  // 每次都要past所有的ejs variable
  List.find(function(err, result) {
    if (err) {
      console.log(err);
    } else {
      const AllList = new Set();
      console.log(result);
      console.log("---------------------------------")
      result.forEach(function(list) {
        AllList.add(list.listName);
      });
      AllList.forEach(function(list) {
        console.log(list);
      })
      res.render("index", {
        listTitle: day,
        itemsOfList: AllList
      });
    }
  });
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

app.get("/:CustomListName", function(req, res) {
  const customListName = req.params.CustomListName;
  if (customListName != 'favicon.ico') {
    //
    List.findOne({listName: customListName}, function(err, result) {
      if (!err) {
        if (!result) {
          const list = new List({
            listName: customListName,
            itemList: items
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          items = result.itemList;
          res.render("list", {
            listTitle: customListName,
            itemsOfList: items
          });
        }
      }
    });
    //
  }
});

const Work = mongoose.model("Work", itemSchema);

app.post("/delete", function(req, res) {
  const id = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Work") {
    Work.findByIdAndRemove({
      _id: id
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("item deleted");
      }
    });
    res.redirect("/work");
  } else {
    const query = {listName: listName};
    const update = {$pull: {itemList: {_id : id}}};
    List.findOneAndUpdate(query, update, {useFindAndModify: false}, function(err,result) {
      if (!err) {
        res.redirect("/" + listName);
      };
    });

  }
});




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
    const customListName = req.body.list;
    console.log(customListName);
    const item = new Item({
      name: req.body.newItem
    });
    List.findOne({
      listName: customListName
    }, function(err, result) {
      if (!err) {
        if (!result) {} else {
          result.itemList.push(item);
          result.save();
        }
      }
    });
    res.redirect("/" + customListName);
  }
});

// 指定端口
app.listen(3000, function() {
  console.log("Server listening on port 3000")
});

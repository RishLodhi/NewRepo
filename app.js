//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require('mongodb');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDb");
mongoose.connect("mongodb+srv://admin-rishabh:Rishabh%40123@atlascluster.mim1ysy.mongodb.net/");

const itemsSchema = mongoose.Schema({
  name: {type: String, required: true}
});

const Item = mongoose.model("item",itemsSchema);


const workItems = [];

const item1 = new Item({
  name: "Welcome to your Todo List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit the left checkbox to delete an item"
});

const defautItems = [item1,item2,item3];

const ListSchema = mongoose.Schema({
  ListName: String,
  items: [itemsSchema]
});


const List = mongoose.model("List",ListSchema);


app.get("/", function(req, res) {
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0){
      Item.insertMany(defautItems);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });
  console.log(listName);
  if (listName === "Today"){
  newItem.save();
  console.log(newItem);
  res.redirect("/");
  } else{
    List.findOne({ListName : listName}).then(foundlist => {
      console.log(foundlist);
        foundlist.items.push(newItem);
        foundlist.save();
        res.redirect("/" + listName);
    })
  } 
});

app.post("/delete", function(req, res){

   const checkedItemName = req.body.checkbox;
   const listname = req.body.listName;
   if (listname === "Today"){
    Item.findByIdAndDelete(checkedItemName)
    .then(doc => {
        if (doc) {
            console.log('Document deleted successfully:', doc);
        } else {
            console.log('Document not found');
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
    res.redirect("/");
   } else {
    List.findOneAndUpdate({ListName: listname},{$pull: {items: {_id : checkedItemName}}}).then(foundList => {
      res.redirect("/" + listname);
    })
   }
   
});

app.get("/:paramName", function(req,res){

  const NewList = _.capitalize(req.params.paramName);
  if (NewList != "favicon.ico") {
   List.findOne({ListName : NewList}).then(foundList => {
    if (!foundList) {
      const list = new List({
        ListName: NewList,
        items: defautItems
      });
    
      list.save();
      res.redirect("/" + NewList);
    }
    else{
      //show an existing list
      res.render("list", {listTitle: NewList, newListItems: foundList.items});
    }
   })
  
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

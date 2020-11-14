const express = require ("express");
const bodyParser = require ("body-parser");

const mongoose = require('mongoose');
const _ = require("lodash")

const app = express();
// const items=[];
// const workItems=[];
 app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-neha:Test123@cluster0.xmacx.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});


const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];
 const listSchema ={
   name:String,
   items:[itemsSchema]
 };
 const List = mongoose.model("List", listSchema);

  app.get ("/",function(req,res){

    Item.find({}, function(err,foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Sucessfully added");
          }
        });
        res.redirect("/");
      }else{
        res.render("list",{listTitle:"Today", newitems : foundItems});

      }
    });
    })

  app.post("/",function(req,res){
    const itemName = req.body.item;
    const listName= req.body.list;
    const item = new Item({
      name:itemName
    });
    if(listName==="Today"){

          item.save();
          res.redirect("/")
        }
          else{
         List.findOne({name: listName}, function(err, foundList){
           foundList.items.push(item);
           foundList.save();
           res.redirect("/" + listName);
         })
          }
    })

    // if(req.body.list==="Work"){
    //    workItems.push(item);
    //    res.redirect("/work");
    //  }
    //  else{
    //    items.push(item);
    //    res.redirect("/");}

  app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
if(!err){
  if(!foundList){
    // create a new list
    const list = new List({
      name:customListName,
      items:defaultItems
    })
    list.save();
    res.redirect("/" + customListName);
  }
  else{
    //show an existing list
      res.render("list",{listTitle:foundList.name, newitems : foundList.items});
  }
}
    })

  })
  app.post("/delete",function(req,res){
    const checkedItemId= req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
          console.log("Successfully deleted checked item");
          res.redirect("/")
        }
      })
    }
    else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundList){
        if(!err){
          res.redirect("/" +listName);
        }
      })
    }


  });// it is necessary to provide a call back
  // app.get("/work",function(req,res){
  //   res.render("list",{listTitle:"Work List", newitems : workItems});
  // })
  // app.post("/work",function(req,res){
  //     const item = req.body.item;
  //   if(req.body.list==="Work"){
  //     workItems.push(item);
  //     res.redirect("/work");
  //   }
  //   else{
  //       workItems.push(item);
  //       res.redirect("/");
  //   }
  //
  // })

  app.listen(process.env.PORT || 3000,function(){
    console.log("server is running");
  });

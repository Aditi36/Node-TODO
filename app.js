//21SsOiVISyiWmqzv

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose")
const _ = require("lodash")
const uri = `mongodb+srv://todo:21SsOiVISyiWmqzv@cluster0.a02r5.mongodb.net/<dbname>?retryWrites=true&w=majority`

app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URI||uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})



const itemsSchema = {
    name: {
        type: String
      }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });





const defaultItems = [item1, item2,item3]

const listSchema = {
    name : String,
    items : [itemsSchema]
}

 const List  = mongoose.model("List", listSchema);


app.get("/", (req, res) => {



    Item.find({}, function (err, foundItems) {

        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Succesfully saved to db")
                }
            });
            res.redirect("/")
        }

        else {
            res.render("list", {
                listTitle: "Today", newListItems: foundItems});
            }
        });
    



    
});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;


     const item = new Item({
         name : itemName
     });
     if(listName === "Today"){
        item.save();
        res.redirect("/")
     }
     else{
         List.findOne({name:listName},function(err,foundList){
             foundList.items.push(item);
             foundList.save();
             res.redirect("/"+listName)
         })
     }

  
})

app.post("/delete",(req,res)=>{
    const checked = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
     Item.findByIdAndRemove(checked, function(err){
        if(!err){
        console.log("successfully deeleted checked")
        res.redirect("/")
        }
    })
}
else{
 List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checked}}},function(err,foundList){
     if(!err){
         res.redirect("/"+listName);
     }
 })
}
})

app.get("/:customListName",(req,res)=>{
 const customListName =_.capitalize(req.params.customListName);
 List.findOne({name: customListName}, function(err,foundList){
     if(!err){
         if(!foundList){
            const list = new List({
                name : customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+ customListName)
         }
         else{
             res.render("list",{
                listTitle: foundList.name, newListItems: foundList.items})
         }
     }
 })

 
})

let port = process.env.PORT;

   if(port == null || port == ""){
     port = 8000;
   }

app.listen(port, function () {
    console.log("server running on server")
})
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();


// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-Vishakha:i1D2DxK5Kh89kT9i@cluster0.ifkxx.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name: String,
}

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item(
    {
        name: "Welcome to your todolist!",
    });
const item2 = new Item({
    name: "Hit the + button to add a new item",
});
const item3 = new Item({
    name: "<---Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("error");
                } else {
                    console.log("Successfully saved default items to database");
                }
            });
            res.redirect('/');
        } else {
            res.render('list', { listTitle: "Today", newListItems: foundItems });
        }
    });

});

app.get('/:customListName', function (req, res) {
    const customlistName = _.capitalize(req.params.customListName);

    List.findOne({ name: customlistName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customlistName,
                    items: defaultItems,
                });
                list.save();
                res.redirect("/" + customlistName);
            } else {
                res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

});

app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });

    if (listName === "Today") {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully item deleted");
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});



app.listen(process.env.PORT || '3000', function(){
    console.log("Express server listening ");
  });
var mysql = require("mysql");
var inquirer = require("inquirer");

var exit = false;
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",
    password: "MERLIn372049!",
    database: "bamazon"
});

connection.connect(function(err) {
    if(err) throw err;
    console.log("connected to Bamazon");
    readAll();
});

function readAll(){
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;
        console.log("--------------------");
        for (i=0; i < res.length; i++){
            console.log("ID: " +res[i].item_id);
            console.log("Item: " + res[i].product_name);
            console.log("Price: $" + res[i].price);
            console.log(" ");
        };
        console.log("--------------------");
        getInput();
    })
}

function getInput(){
    inquirer.prompt({
        name: "action",
        message: "Select and item ID or EXIT"
    }).then(function(answers){
        var action = answers.action.toUpperCase()
        switch(action){
            case "EXIT":
                exit = true;
                connection.end();
                break;
            default: 
                dbQuery(answers.action);
                break;
        }
    })
}

function dbQuery(input){
    if(!exit){
        inquirer.prompt({
            name: "quantity",
            message: "Select a quantity."
        }).then(function(answers){
            console.log(input)
            connection.query("SELECT * FROM products WHERE ?", { item_id: input }, function(err, res){
                if(res[0].stock_quantity >= 1){
                    var total = res[0].price * parseInt(answers.quantity);
                    console.log("You have purchased " + answers.quantity + " " + res[0].product_name + " for a total of $" + total);
                    var stockQuantity = parseInt(res[0].stock_quantity) - parseInt(answers.quantity);
                    decrementStock(input, stockQuantity, answers.quantity);
                }
                else{
                    console.log("Insufficient quantity!")
                    getInput();
                }
            })
        })
    }
}

function decrementStock(itemID, stockQuantity){
    connection.query("UPDATE products SET stock_quantity = ? WHERE item_ID = ?", [stockQuantity, itemID], function(err, res, fields){
        if(err) throw err;
        getInput();
    })
}
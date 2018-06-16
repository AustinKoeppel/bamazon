const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.query("SELECT id,product_name,price FROM products order by id", function(err, result) {
    if(err) {
        console.log("Error connecting and running query");
        return false;
    }

    for (var i = 0; i < result.length; i++) {
      console.log("ID: " + result[i].id);
      console.log(" Product: " + result[i].product_name);
      console.log(" Price: " + result[i].price);
    }
    askQuestions();
});

function askQuestions() {
    inquirer.prompt([
        {
        name: "id",
        message: "What product ID would you like to purchase?"
        }, {
        name: "quantity",
        message: "How much would you like to buy?"
        }
    ]).then(function(answers) {
        checkQuantity(answers.id, answers.quantity, updateDb);
    });
}

function checkQuantity(id, quantity,cb) {
    id = parseInt(id);
    if(id != NaN) {
        connection.query("SELECT stock_quantity FROM products WHERE id=?",[id], function(err, result) {
            if(!err && result.length == 1 && parseInt(quantity) < result[0].stock_quantity) {
                cb(id, parseInt(result[0].stock_quantity) - parseInt(quantity), parseInt(quantity));
            }
            else {
                console.log("Insufficient quantity!");
            }
        });
    }
}

function updateDb(id, quantity,purchasedAmount) {
    connection.query("UPDATE products SET stock_quantity=? WHERE id=?",[quantity,id], function(err, result) {
        if(err) {
            console.log("This is embarassing, something went wrong", err);
            return;
        }
        else {
            connection.query("SELECT price FROM products WHERE id=?",[id], function(err, result) {
                if(err) {
                    console.log("This is embarassing, something went wrong", err);
                    return;
                }
                else {
                    console.log("Your total is: " + result[0].price*purchasedAmount);
                }
            });
        }
    });
}
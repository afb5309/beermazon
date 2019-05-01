var mysql = require("mysql");;
var inquirer = require("inquirer");
var table = require("console.table");
var colors = require("colors");
var emoji = require("node-emoji")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hello",
    database: "beermazon"
});

connection.connect(function (err) {
    if (err) throw err;
    var beer = emoji.get('beer');
    var beers = emoji.get('beers');
    var openingText = `\n${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer}\n\n Hello Customer, welcome to Beermazon ${beers} ! Check out all the craft beer we have in stock!\n\n${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer} ${beer}`
    console.log(openingText.green);
    console.log("\n");
    showBeer();
});

function showBeer() {
    connection.query("SELECT * from inventory;", function (err, results) {
        if (err) throw err; else {
            var table = results;
            console.table(table);
        }
        pickBeer();
    })
};

function pickBeer() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "selection",
                message: "Which beer would you like to purchase?",
                choices: ["Alien Church", "Stacy's Mom", "Fat Tire", "World Wide Stout","Hipster Catnip", "Pliny The Younger", "Doubleganger", "Double Citra","Atrial Rubicite", "Flora Plum"],
            },
            {
                type: "input",
                name: "ammount",
                message: "How many cases would you like to purchase?"
            }
        ])
        .then(function (answer) {

            var item = answer.selection;
            var quantity = answer.ammount;
            var queryinventory = "SELECT * FROM inventory WHERE ?";

            connection.query(queryinventory, { Beer_Name: item }, function (err, res) {
                var mysql = res[0];
                var topspacer = `___________________________________________________________________________________________\n`;
                var spacer = `___________________________________________________________________________________________`;

                if (err) throw err;
                if (quantity > mysql.Quantity) {
                    var beers = emoji.get('beers');
                    var sad = emoji.get('pensive');
                    var sorry = `Appologies, it seems as though we don't have enough in stock to fullfill your order.${sad}`;
                    var back = `Taking you back to the homescreen...${beers}`;
                        console.log(topspacer.cyan);
                        console.log(sorry.green);
                        console.log(topspacer.cyan);
                        console.log(back.green);
                        console.log(spacer.cyan);
                        console.log("\n");
                    showBeer();
                }
                else {
                    if (quantity <= mysql.Quantity) {
                        var quantityPrompt = "We have " + quantity + " cases of " + mysql.Beer_Name + " in our warehouse ready to be shipped!";

                        console.log(topspacer.cyan);
                        console.log(quantityPrompt.green);
                        console.log(spacer.cyan);
                        console.log("\n");

                        inquirer.prompt([
                            {
                                type: "list",
                                name: "confirm",
                                message: "Are you sure you would like to purchase this item?",
                                choices: ["Yes", "No"],
                            },
                        ])
                            .then(function (answer) {
                                if (answer.confirm === "Yes") {
                                    var beers = emoji.get('beers');
                                    var thanks = `Looks like somebody is ready to have a good time! ${beers}`;
                                    var cost = "Your beer purchase ammounts to $" + (mysql.Price * quantity) + ".00";

                                    console.log("\n");
                                    console.log(topspacer.cyan);
                                    console.log(thanks.green);
                                    console.log(topspacer.cyan);
                                    console.log(cost.green);
                                    console.log(spacer.cyan);
                                    console.log("\n");

                                    var itemQuantity = mysql.Quantity - quantity;

                                    connection.query("UPDATE inventory SET ? WHERE ?", [
                                        {
                                            Quantity: itemQuantity
                                        },
                                        {
                                            Beer_Name: item
                                        }]);

                                    inquirer.prompt([
                                        {
                                            type: "list",
                                            name: "continue",
                                            message: "Are you interested in purchasing another item?",
                                            choices: ["Yes", "No"],
                                        },
                                    ])
                                        .then(function (answer) {
                                            if (answer.continue === "Yes") {
                                                console.log("\n");
                                                showBeer();
                                            }
                                            if (answer.continue === "No") {
                                                var cash = emoji.get('money_with_wings');
                                                var bye = `Thanks for your purchase ${cash}  Come again sometime soon!`
                                                console.log(topspacer.cyan);
                                                console.log(bye.green)
                                                console.log(spacer.cyan);
                                                console.log("\n");
                                                connection.end()
                                            }
                                        })
                                }
                                else if (answer.confirm === "No") {
                                    inquirer.prompt([
                                        {
                                            type: "list",
                                            name: "unsure",
                                            message: "Okay no worries, what would you like to do?",
                                            choices: ["Go Back", "Exit Beermazon"],
                                        },
                                    ])
                                    .then(function (answer) {
                                        if (answer.unsure === "Go Back") {
                                            var beers = emoji.get('beers');
                                            var back = `Taking you back to the homescreen...${beers}`
                                                console.log(topspacer.cyan);
                                                console.log(back.green)
                                                console.log(spacer.cyan);
                                                console.log("\n");
                                            showBeer();
                                        }
                                        else if (answer.unsure === "Exit Beermazon"){
                                            var beer = emoji.get('beer');
                                            var bye = `Come again sometime soon ${beer} !`
                                                console.log(topspacer.cyan);
                                                console.log(bye.green)
                                                console.log(spacer.cyan);
                                                console.log("\n");
                                                connection.end()
                                        }
                                    })
                                }
                            })
                    }
                }
            });
        })
};

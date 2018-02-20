
var express = require('express');
var mongojs = require('mongojs');
var request = require("request");
var cheerio = require("cheerio");
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

// var databaseUrl = "hearthSearch";
// var collections = ["cards"];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.Promise = Promise;

var developmentUrl = "mongodb://localhost/hearthsearch"

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
} else {
    mongoose.connect(developmentUrl)
}




var db = require('./models')

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname+"/index.html"))
});

function Deck(name, cards, archetype, user, cost, hero) {
    this.name = name
    this.cards = cards
    this.archetype = archetype
    this.user = user
    this.cost = cost
    this.source = 'HearthPwn'
    this.format = 'wild'
    this.hero = hero
}

app.get('/api/decks', function(req, res) {
    db.Deck.find({}, function(err, found) {
        res.send('done');
    })
})

app.get("/decks/cards", function(req, res) {
    console.log('checkin')
    request("https://www.hearthpwn.com/decks?filter-show-standard=2&filter-show-constructed-only=y&filter-deck-tag=1", function(error, response, html) {

        console.log('scrapin')
        var $ = cheerio.load(html);

        var results = []

        $("span.tip").each((i, element) => {
            var link = $(element).find("a").attr('href')

            if (link) {
                results.push('http://www.hearthpwn.com/' + link);        
            }
        })

        for (var i=0; i<5; i++) {request(results[i], function(error, response, html) {
            var $ = cheerio.load(html);

            var name = $('.deck-title').text()
            console.log($('.deck-title').text())
            var archetype = $('span.deck-type').children('span').children('a').text()
            var cost = $('.craft-cost').text().trim()
            var user = $('li.name').children('a').text()
            user = user.replace(/\n/g, '').trim()
            

            let hero = $('section .deck-info').attr('class')
            hero = hero.split(' ')
            hero = hero[1]

            var cards = []    
        
            $("b").each((i, element) => {
                var cardName = $(element).find('a').text()
                cardName = cardName.replace(/\n/g, '').trim()
        
                var cardQuantity = $(element).find('a').attr('data-count')
                var cardRarity = $(element).find('a').attr('data-rarity')

                
                console.log("HI?")
                
                if (cardQuantity && cardRarity) {
                console.log("ADDING")
                    
                    console.log('name', cardName)

                    db.Card.findOne({'name': cardName})
                    .then(card => {
                        let _id = card._id
                        let cardObj = {
                            _id,
                            cardQuantity
                        }
                        
                        cards.push(cardObj)
                })
                }
        
            })
            
            setTimeout(function() {
                console.log('cards', cards)
                console.log(new Deck(name, cards, archetype, user, cost))

            // if (name && cards && archetype && user && cost && hero) {
                db.Deck.create(new Deck(name, cards, archetype, user, cost, hero))
                .then(function(data) {
                    console.log("New deck added")
                    console.log(data)
                })
            //     .catch(function(err) {
            //         // If an error occurred, send it to the client
            //         return res.json(err);
            //     });
            // } else {
            //     console.log('problem')
            //     console.log(name)
            //     console.log(cards)
            //     console.log(archetype)
            //     console.log(user)
            //     console.log(cost)
            //     console.log(hero)
                
            // }
            }, 8000)
            
            })
        }
    })
})

app.post('/decks/:id', function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Deck.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(deck) {
            res.json(deck)
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
})

app.get("/decks/:id", function(req, res) {
    console.log(req.params.id)
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Deck.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbDeck) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbDeck);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("App running on port 3000!");
});
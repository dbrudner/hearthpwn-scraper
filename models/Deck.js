var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DeckSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    
    cardsAdded: {
        type: Boolean,
        default: false,
    },

    hero: {
        type: String,
        required: true
    },

    archetype: {
        type: String,
        required: true
    },

    cards: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: "Card"
        },
        cardQuantity: {
            type: Number
        }
    }],

    format: {
        type: String,
        required: true
    },

    //   This field is for where the deck came from -- hearthhead, hearthypwn, hearthsearch, etc.
    source: {
        type: String,
        required: true
    },

    description: {
        type: String
    },
   
    upvotes: {
        type: Number,
        default: 0
    },

    curve: {
        type: Number
    },
    
    user: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

var Deck = mongoose.model("Deck", DeckSchema);

module.exports = Deck;
class Card {
    constructor(suit, value, faceDown = false) {
        this.suit = suit;
        this.value = value;
        this.faceDown = faceDown
    }

    get image() {
        if (this.faceDown) {
            return "cards/card_back.png"
        }
        return `cards/${this.value}_of_${this.suit}.svg`
    }

    get worth() {
        if (["jack", "queen", "king"].includes(this.value)) {
            return 10
        }
        if (this.value === "ace") {
            return 11
        }
        return parseInt(this.value)
    }
}

class Deck {
    constructor(packsOfCards, reshufleAt) {
        this.packsOfCards = packsOfCards
        this.reshufleAt = reshufleAt
        this.reset(packsOfCards, reshufleAt)
        this.shuffle()
    }

    reset() {
        const suits = ["hearts", "spades", "diamonds", "clubs"]
        //const values = ["5", "5", "5", "5", "5", "5", "5", "5", "5", "5", "5", "5", "5", ]
        //const values = ["ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace"]
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"]
        this.deck = []


        for (let i = 0; i < this.packsOfCards; i++) {
            for (let j = 0; j < suits.length; j++) {
                for (let k = 0; k < values.length; k++) {
                    this.deck.push([suits[j], values[k]])
                }
            }
        }

    }
    //Fisher–Yates Shuffle
    shuffle() {
        const deck = this.deck;
        let m = deck.length;
        let i;

        while (m) {
            i = Math.floor(Math.random() * m--);

            [deck[m], deck[i]] = [deck[i], deck[m]];
        }

        return this;
    }

    draw() {
        let cardsInPack = 52
        //draw or first reset and reset deck
        console.log(this.packsOfCards * cardsInPack * this.reshufleAt)
        if (this.deck.length > this.packsOfCards * cardsInPack * this.reshufleAt) {
            let cardProperties = this.deck.pop() //[suit, value]
            return new Card(cardProperties[0], cardProperties[1])
        }
        else {
            this.reset()
            this.shuffle()
            console.log('deck shuffled')
            return this.draw()
        }
    }
}

class Hand {
    constructor(CardsEl) {
        this.cards = []
        this.CardsEl = CardsEl  //HTML element that shows cards
        this.isInPlay = true
    }

    dealOne(deck, faceDown = false) {
        let card = deck.draw()
        card.faceDown = faceDown
        this.cards.push(card)
        this.CardsEl.innerHTML += `<img class="card-image" src="${card.image}">`
    }

    sum() {
        let sum = 0
        let numOfAces = 0
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i]
            if (!card.faceDown) {
                sum += card.worth
                if (card.worth == 11) {
                    numOfAces++
                }
            }
        }
        while (sum > 21 && numOfAces > 0) {
            numOfAces--
            sum -= 10
        }
        return sum
    }

    clear() {
        this.cards = []
        this.CardsEl.innerHTML = ""
        this.rerender()
    }

    rerender() {
        this.CardsEl.innerHTML = ""
        for (let i = 0; i < this.cards.length; i++) {
            this.CardsEl.innerHTML += `<img class="card-image" src="${this.cards[i].image}">`
        }
    }
}


class Player {
    constructor(chips = 1000) {
        this.chips = chips
        this.hands = [new Hand(document.getElementById("PlayerCards-el"))]
        this.bet = 100
        this.insuranceFlag = false
    }

    clearHands(){
        for (let i = 0; i < this.hands.length; i++) {
            let hand = this.hands[i]
            hand.clear()
        }
    }

    removeAllButFirstHand() {
        //let hand = 
        this.hands = [this.hands[0]]
    }

    hit(game, hand) {
        if (hand.isInPlay === true) {
            hand.dealOne(game.deck)
            sumEl.textContent = "sum: " + hand.sum()
            if (hand.sum() >= 21) {
                hand.isInPlay = false
                game.nextHand()
            }
            if (hand.isInPlay === false) {
                this.stand(game, hand)
            }
        }
    }
    
    stand(game, hand) {
        if (hand.isInPlay === true) {
            hand.isInPlay = false
            //dealer.play()
            //this.resolve(hand)
            game.nextHand()
        }
    }
    
    double(game, hand) {
        if (hand.isInPlay === true && (hand.sum() === 11 || hand.sum() === 10)) {
                hand.isInPlay = false
                hand.chips -= this.bet
                hand.bet *= 2
                hand.dealOne(game.deck)
                sumEl.textContent = "sum: " + hand.sum()
                game.nextHand()
        }
    }

    insurance(game) {
        if (game.dealer.hand.cards[1].value === "ace" && this.insuranceFlag === false) {
            this.insuranceFlag = true;
            this.chips -= (this.bet * 1)
            console.log("insured");
        }
    }

    insurancePayout(game) {
        if (this.insuranceFlag === true && (game.dealer.hand.sum() === 21 && game.dealer.hand.cards.length === 2)){
            this.chips += (this.bet * 2)
        }
        this.insuranceFlag = false
    }
    
    split(game, hand) {
        if (hand.cards[0].value === hand.cards[1].value && hand.cards.length === 2 && this.hands.length < 4) {
            this.chips -= this.bet
            let secondCard = hand.cards.pop()
            let newhand = new Hand(document.getElementById(`PlayerCards-el${this.hands.length}`))
            newhand.cards.push(secondCard)
            this.hands.push(newhand)
            hand.dealOne(game.deck)
            newhand.dealOne(game.deck)
            hand.rerender()
            newhand.rerender()
            console.log(this.hands)
        }
    }

    resolve(game, hand) {
        if (hand.sum() > 21) {
            // player loses
            messageEl.textContent = "Bust! You loose."
        }
        else if ((game.dealer.hand.sum() === 21 && game.dealer.hand.cards.length === 2 && !(hand.sum() === 21 && hand.cards.length === 2))){
            //dealer has blackjack, player does not
            messageEl.textContent = "You loose."
        }

        else if (hand.sum() === 21 && hand.cards.length === 2 && !(game.dealer.hand.cards.length == 2 && game.dealer.hand.sum == 21)) {
            //players wins blackjack
            this.chips += Math.round(this.bet * (eval(BlackJackPayout) + 1))
            messageEl.textContent = "BlackJack win!"
        }

        else if (hand.sum() === game.dealer.hand.sum()) {
            //draw
            this.chips += (this.bet * 1)
            messageEl.textContent = "It's a draw"
        }

        else if (hand.sum() > game.dealer.hand.sum() || game.dealer.hand.sum() > 21) {
            //player wins
            this.chips += (this.bet * 2)
            messageEl.textContent = "You win!"
        }
        else {
            //player losees
            messageEl.textContent = "You loose."
        }
        actionButtons.style.visibility = 'hidden'
        document.getElementById("start-el").style.visibility = 'visible'
        chipsEl.textContent = "chips: " + game.player.chips
    }

}

class Dealer {
    constructor() {
        this.hand = new Hand(document.getElementById("DealerCards-el"))
    }

    async play() {
        this.hand.cards[0].faceDown = false
        this.hand.rerender()
        while (this.hand.sum() < 17) {
            await sleep(1000)
            this.hand.dealOne(game.deck)
        }
    }

}

class Game {
    constructor() {
        this.reset
    }

    reset() {
        this.deck = new Deck(deckCount, ReshuffleDeckAt)
        this.player = new Player
        this.dealer = new Dealer
        this.settings = 0
        this.currentHand = this.player.hands[0]
        this.n = 0
        this.startRound()
    }

    startRound() {
        this.player.bet = document.getElementById("bet-el").value
        settingsEl.style.display = 'none' //'block' to make visible
        if (this.player.bet > 0 && this.player.bet <= this.player.chips) {
            document.getElementById("start-el").style.visibility = 'hidden'
            actionButtons.style.visibility = 'visible'
            messageEl.textContent = "_"
            this.player.hands[0].isInPlay = true
            //player.hands[0].clear()
            this.player.clearHands()
            this.player.removeAllButFirstHand()
            console.log(this.player.hands)
            this.dealer.hand.clear()
            this.player.chips -= this.player.bet
            this.player.hands[0].dealOne(this.deck)
            this.player.hands[0].dealOne(this.deck)
            this.dealer.hand.dealOne(this.deck, true) //faceDown = true
            this.dealer.hand.dealOne(this.deck)
            this.currentHand = this.player.hands[0]
            sumEl.textContent = "sum: " + this.player.hands[0].sum()
            chipsEl.textContent = "chips: " + this.player.chips
            this.n = 0
        }
        
        else {messageEl.textContent = "Invalid bet"}
    }

    async nextHand() {
        this.n += 1
        if (this.n < this.player.hands.length) {
            this.currentHand = this.player.hands[this.n]
            sumEl.textContent = this.currentHand.sum()
            console.log(this.currentHand)
        }
        else {
            await this.dealer.play()
            this.player.insurancePayout(this)
            await sleep(1000)
            for (let i = 0; i < this.player.hands.length; i++) {
                let hand = this.player.hands[i]
                this.player.resolve(this, hand)
                await sleep(2000)
            }
        } 
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let actionButtons = document.getElementById("actionButtons-el")
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
let chipsEl = document.getElementById("chips-el")
let settingsEl = document.getElementById("settings-el")

var deckCount = Number(document.getElementById('deckCount').value)
var BlackJackPayout = document.getElementById('BlackJackPayout').value
var DealerHitsSoft17 = document.getElementById('DealerHitsSoft17').value
var ReshuffleDeckAt = Number(document.getElementById('ReshuffleDeckAt').value)
let game = new Game
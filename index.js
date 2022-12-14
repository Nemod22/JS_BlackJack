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
    constructor() {
        this.reset()
    }

    reset(packsOfCards = 4) {
        const suits = ["hearts", "spades", "diamonds", "clubs"]
        //const values = ["ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace", "ace"]
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"]
        this.deck = []

        for (let i = 0; i < packsOfCards; i++) {
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

    draw(reshufleAt = 0.5, packsOfCards = 4) {
        let cardsInPack = 52
        //draw or first reset deck
        if (this.deck.length > packsOfCards * cardsInPack * reshufleAt) {
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

// class PlayerHand extends Hand {

//     constructor (cardsEl) {
//         super(cardsEl)
//         this.isInPlay = true
//     }
// }

class Player {
    constructor(chips = 1000) {
        this.chips = chips
        this.hands = [new Hand(document.getElementById("PlayerCards-el"))]
        this.bet = 100
    }

    clearHands(){
        for (let i = 0; i < this.hands.length; i++) {
            let hand = this.hands[i]
            hand.clear()
        }
    }

    removeAllButFirstHand() {
        let hand = 
        this.hands = [this.hands[0]]
    }

    hit(hand) {
        if (hand.isInPlay === true) {
            hand.dealOne(deck)
            sumEl.textContent = "sum: " + hand.sum()
            if (hand.sum() >= 21) {
                hand.isInPlay = false
                nextHand()
            }
            if (hand.isInPlay === false) {
                this.stand(hand)
            }
        }
    }
    
    stand(hand) {
        if (hand.isInPlay === true) {
            hand.isInPlay = false
            //dealer.play()
            //this.resolve(hand)
            nextHand()
        }
    }
    
    double(hand) {
        if (hand.isInPlay === true && (hand.sum() === 11 || hand.sum() === 10)) {
                hand.isInPlay = false
                hand.chips -= this.bet
                hand.bet *= 2
                hand.dealOne(deck)
                nextHand()
        }
    }
    
    insurance() {
        if (dealer.hand.cards[1].value === "ace") {
            console.log("ok")
        }
    }
    
    split(hand) {
        if (hand.cards[0].value === hand.cards[1].value && hand.cards.length === 2 && this.hands.length < 4) {
            this.chips -= this.bet
            let secondCard = hand.cards.pop()
            //console.log(`PlayerCards-el${this.hands.length}`)
            let newhand = new Hand(document.getElementById(`PlayerCards-el${this.hands.length}`))
            newhand.cards.push(secondCard)
            this.hands.push(newhand)
            hand.dealOne(deck)
            newhand.dealOne(deck)
            hand.rerender()
            newhand.rerender()
            console.log(this.hands)
        }
    }

    resolve(hand) {
        if (hand.sum() > 21 || (dealer.hand.sum() === 21 && dealer.hand.cards.length === 2)) {
            // player loses
            messageEl.textContent = "Bust! You loose."
        }

        else if (hand.sum() === 21 && hand.cards.length === 2 && !(dealer.hand.cards.length == 2 && dealer.hand.sum == 21)) {
            //players wins blackjack
            this.chips += (this.bet * 5 / 2)
            messageEl.textContent = "BlackJack win!"
        }

        else if (hand.sum() === dealer.hand.sum()) {
            //draw
            this.chips += (this.bet * 1)
            messageEl.textContent = "It's a draw"
        }

        else if (hand.sum() > dealer.hand.sum() || dealer.hand.sum() > 21) {
            //player wins
            this.chips += (this.bet * 2)
            messageEl.textContent = "You win!"
        }
        else {
            //player losees
            messageEl.textContent = "You loose."
        }
        hitButton.style.visibility = 'hidden'
        standButton.style.visibility = 'hidden'
        doubleButton.style.visibility = 'hidden'
        insuranceButton.style.visibility = 'hidden'
        splitButton.style.visibility = 'hidden'
        document.getElementById("start-el").style.visibility = 'visible'
        document.getElementById("start-el").textContent = 'NEW ROUND'
        chipsEl.textContent = "chips: " + player.chips
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
            this.hand.dealOne(deck)
        }
    }

}
let hitButton = document.getElementById("hit-el")
let standButton = document.getElementById("stand-el")
let doubleButton = document.getElementById("double-el")
let insuranceButton = document.getElementById("insurance-el")
let splitButton = document.getElementById('split-el')
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
chipsEl = document.getElementById("chips-el")

hitButton.style.visibility = 'hidden'
standButton.style.visibility = 'hidden'
doubleButton.style.visibility = 'hidden'
insuranceButton.style.visibility = 'hidden'
splitButton.style.visibility = 'hidden'

//let players = [new Player]
let player = new Player
let deck = new Deck
let dealer = new Dealer
deck.shuffle()

function startRound() {
    player.bet = document.getElementById("bet-el").value
    document.getElementById("start-el").style.visibility = 'hidden'
    hitButton.style.visibility = 'visible'
    standButton.style.visibility = 'visible'
    doubleButton.style.visibility = 'visible'
    insuranceButton.style.visibility = 'visible'
    splitButton.style.visibility = 'visible'
    messageEl.textContent = "_"
    player.hands[0].isInPlay = true
    //player.hands[0].clear()
    player.clearHands()
    player.removeAllButFirstHand()
    console.log(player.hands)
    dealer.hand.clear()
    player.chips -= player.bet
    player.hands[0].dealOne(deck)
    player.hands[0].dealOne(deck)
    dealer.hand.dealOne(deck, faceDown = true)
    dealer.hand.dealOne(deck)
    currentHand = player.hands[0]
    sumEl.textContent = "sum: " + player.hands[0].sum()
    chipsEl.textContent = "chips: " + player.chips
    n = 0
}

let n = 0
let currentHand = player.hands[0]
async function nextHand() {
    n += 1
    if (n < player.hands.length) {
        currentHand = player.hands[n]
        sumEl.textContent = currentHand.sum()
        console.log(currentHand)
    }
    else {
        await dealer.play()
        await sleep(1000)
        for (let i = 0; i < player.hands.length; i++) {
            let hand = player.hands[i]
            player.resolve(hand)
            await sleep(2000)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
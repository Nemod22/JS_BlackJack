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
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"]
        this.deck = []
        this.shuffleFlag = false


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
        //draw and check if cards have to be shuffled before next round
        let cardsInPack = 52

        //just in case
        if (this.deck.length == 0) {
            this.reset()
            this.shuffle
        }
        
        if (this.deck.length < this.packsOfCards * cardsInPack * (this.reshufleAt)) {
            this.shuffleFlag = true
        }
        let cardProperties = this.deck.pop() //[suit, value]
        return new Card(cardProperties[0], cardProperties[1])
        
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

    sumFun() {
        let sum = 0
        let numOfAces = 0
        let soft = false
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
        if (numOfAces > 0){
            soft = true
        }
        return [sum, soft]
    }

    get sum() {
        return this.sumFun()[0]
    }

    get isSoft() {
        return this.sumFun()[1]
    }

    fade() {
        this.CardsEl.style.opacity = '0.5'
    }

    unfade() {
        this.CardsEl.style.opacity = '1'
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
        this.hands[0].unfade() 
        this.hands = [this.hands[0]]
    }

    hit(game, hand) {
        if (hand.isInPlay === true) {
            hand.dealOne(game.deck)
            sumEl.textContent = "sum: " + hand.sum
            if (hand.sum >= 21) {
                hand.isInPlay = false
                game.nextHand()
            }
            if (hand.isInPlay === false) {
                this.stand(game, hand)
            }
        }
        game.disableUnavailableActions()
    }
    
    stand(game, hand) {
        if (hand.isInPlay === true) {
            hand.isInPlay = false
            //dealer.play()
            //this.resolve(hand)
            game.nextHand()
        }
    }
    
    canDouble(hand) {
        if (hand.isInPlay === true && hand.cards.length === 2 && this.chips >= this.bet) {
            return true
        }
        return false
    }

    double(game, hand) {
        if (this.canDouble(hand)) {
                hand.isInPlay = false
                this.chips -= this.bet
                this.bet *= 2
                hand.dealOne(game.deck)
                sumEl.textContent = "sum: " + hand.sum
                game.nextHand()
        }
    }
    
    canInsure(game) {
        if (game.dealer.hand.cards[1].value === "ace" && this.insuranceFlag === false && this.chips >= this.bet){
            return true
        }
        return false
    }

    insurance(game) {
        if (this.canInsure(game)) {
            this.insuranceFlag = true;
            this.chips -= (this.bet * 1)
            messageEl.textContent = "insured"
            // console.log("insured")
            game.disableUnavailableActions()
        }
    }

    insurancePayout(game) {
        if (this.insuranceFlag === true && (game.dealer.hand.sum === 21 && game.dealer.hand.cards.length === 2)){
            this.chips += (this.bet * 2)
        }
        this.insuranceFlag = false
    }
    
    canSplit(hand) {
        if (hand.cards[0].value === hand.cards[1].value && hand.cards.length === 2 && this.hands.length < 4 && this.chips >= this.bet) {
            return true
        }
        return false
    }

    split(game, hand) {
        if (this.canSplit(hand)) {
            this.chips -= this.bet
            let secondCard = hand.cards.pop()
            let newhand = new Hand(document.getElementById(`PlayerCards-el${this.hands.length}`))
            newhand.cards.push(secondCard)
            this.hands.push(newhand)
            newhand.fade()
            hand.dealOne(game.deck)
            newhand.dealOne(game.deck)
            hand.rerender()
            newhand.rerender()
            game.disableUnavailableActions()
            console.log(this.hands)
        }
    }

    resolve(game, hand) {
        if (hand.sum > 21) {
            // player loses
            messageEl.textContent = "Bust! You loose."
        }
        else if ((game.dealer.hand.sum === 21 && game.dealer.hand.cards.length === 2 && !(hand.sum === 21 && hand.cards.length === 2))){
            //dealer has blackjack, player does not
            messageEl.textContent = "You loose."
        }

        else if (hand.sum === 21 && hand.cards.length === 2 && !(game.dealer.hand.cards.length == 2 && game.dealer.hand.sum == 21)) {
            //players wins blackjack
            this.chips += Math.round(this.bet * (eval(game.BlackJackPayout) + 1))
            messageEl.textContent = "BlackJack win!"
        }

        else if (hand.sum === game.dealer.hand.sum) {
            //draw
            this.chips += (this.bet * 1)
            messageEl.textContent = "It's a draw"
        }

        else if (hand.sum > game.dealer.hand.sum || game.dealer.hand.sum > 21) {
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
        document.getElementById("bet-el").disabled = false
        chipsEl.textContent = "chips: " + game.player.chips
        if(this.chips === 0){
            messageEl.textContent = "Out of chips, game over!"
            document.getElementById("restart-el").style.display = 'inline'
        }
    }

}

class Dealer {
    constructor(hitSoft) {
        this.hand = new Hand(document.getElementById("DealerCards-el"))
        this.hitSoft = hitSoft
    }

    async play() {
        this.hand.cards[0].faceDown = false
        this.hand.rerender()
        while (this.hand.sum < 17 || (this.hand.sum === 17 && this.hand.isSoft && this.hitSoft)) {
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
        let deckCount = Number(document.getElementById('deckCount').value)
        let BlackJackPayout = document.getElementById('BlackJackPayout').value
        let DealerHitsSoft17 = (document.getElementById('DealerHitsSoft17').value == "Yes") //sets variable to true or false
        let ReshuffleDeckAt = Number(document.getElementById('ReshuffleDeckAt').value)
        let SrartingChips = Number(document.getElementById('SrartingChips').value)

        this.deck = new Deck(deckCount, ReshuffleDeckAt)
        this.player = new Player(SrartingChips)
        this.dealer = new Dealer(DealerHitsSoft17)
        this.currentHand = this.player.hands[0]
        this.BlackJackPayout = BlackJackPayout
        this.n = 0 //curent hand index to be renamed
        settingsEl.style.display = 'none' //'block' to make visible
        bettingEl.style.visibility = 'visible'
    }

    startRound() {
        this.player.bet = document.getElementById("bet-el").value
        if (this.player.bet > 0 && this.player.bet <= this.player.chips && this.player.bet % 1 === 0) {
            document.getElementById("bet-el").disabled = true
            document.getElementById("start-el").style.visibility = 'hidden'
            actionButtons.style.visibility = 'visible'
            messageEl.textContent = "_"
            this.player.hands[0].isInPlay = true
            this.player.clearHands()
            this.player.removeAllButFirstHand()
            console.log(this.player.hands)
            this.dealer.hand.clear()
            this.player.chips -= this.player.bet
            if (this.deck.shuffleFlag === true){
                this.deck.reset()
                this.deck.shuffle()
                messageEl.textContent = "Cards have been reshuffled."
            }
            this.player.hands[0].dealOne(this.deck)
            this.player.hands[0].dealOne(this.deck)
            this.dealer.hand.dealOne(this.deck, true) //faceDown = true
            this.dealer.hand.dealOne(this.deck)
            this.currentHand = this.player.hands[0]
            sumEl.textContent = "sum: " + this.player.hands[0].sum
            chipsEl.textContent = "chips: " + this.player.chips
            this.n = 0
            this.disableUnavailableActions()
            if (this.player.hands[0].sum === 21) {
                this.dealer.play()
                this.player.resolve(this, this.player.hands[0])
            }
        }
        
        else {messageEl.textContent = "Invalid bet"}
    }

    disableUnavailableActions() {
        document.getElementById("double-el").disabled = true;
        document.getElementById("insurance-el").disabled = true;
        document.getElementById("split-el").disabled = true;
        if (this.player.canDouble(this.currentHand)) {
            document.getElementById("double-el").disabled = false;
        }
        if (this.player.canInsure(this)) {
            document.getElementById("insurance-el").disabled = false;
        }
        if (this.player.canSplit(this.currentHand)) {
            document.getElementById("split-el").disabled = false;
        }
    }

    async nextHand() {
        this.n += 1
        if (this.n < this.player.hands.length) {
            this.currentHand.fade()
            this.currentHand = this.player.hands[this.n]
            this.currentHand.unfade()
            sumEl.textContent = "sum: " + this.currentHand.sum
            console.log(this.currentHand)
            this.disableUnavailableActions()
        }
        else {
            document.getElementById("double-el").disabled = true;
            document.getElementById("insurance-el").disabled = true;
            document.getElementById("split-el").disabled = true;
            if (this.player.hands.length > 1) {
                this.currentHand.fade()
            }
            await this.dealer.play()
            this.player.insurancePayout(this)
            await sleep(1000)
            for (let i = 0; i < this.player.hands.length; i++) {
                let hand = this.player.hands[i]
                hand.unfade()
                this.player.resolve(this, hand)
                await sleep(2000)
                if (this.player.hands.length > 1) {
                    hand.fade()
                }
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
let bettingEl = document.getElementById("betting-el")

let game = new Game
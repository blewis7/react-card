import React, {useState, useEffect, useRef} from "react";
import Card from "./Card";
import axios from "axios";

const BASE_URL = "http://deckofcardsapi.com/api/deck";

const Deck = () => {
    const [deck, setDeck] = useState(null);
    const [autoDraw, setAutoDraw] = useState(false);
    const [cardsDrawn, setCardsDrawn] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        async function getData(){
            let d = await axios.get(`${BASE_URL}/new/shuffle/`);
            setDeck(d.data);
        }
        getData();
    }, [setDeck]);

    useEffect(() => {
        async function getCard(){
            let {deck_id} = deck;

            try {
                let res = await axios.get(`${BASE_URL}/${deck_id}/draw/`);

                if (res.data.remaining === 0){
                    setAutoDraw(false);
                    throw new Error("No cards remaining");
                }

                const card = res.data.cards[0];

                setCardsDrawn(cardsDrawn => [
                    ...cardsDrawn,
                    {
                        id: card.code,
                        name: card.value + " of " + card.suit,
                        image: card.image
                    }
                ]);
            } catch (err) {
                alert(err);
            }
        }
        
        if (autoDraw && !timerRef.current){
            timerRef.current = setInterval(async () => {
                await getCard();
            }, 1000);
        }
        
        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(autoDraw => !autoDraw);
    };

    const cards = cardsDrawn.map(c => (
        <Card key={c.id} name={c.name} image={c.image} />
    ));

    const draw = async () => {
        let {deck_id} = deck;
        let res = await axios.get(`${BASE_URL}/${deck_id}/draw/`);
        if (res.data.remaining === 0){
            alert("No cards remaining");
            return;
        }

        const card = res.data.cards[0];

        setCardsDrawn(cardsDrawn => [
            ...cardsDrawn,
            {
                id: card.code,
                name: card.value + " of " + card.suit,
                image: card.image
            }
        ]);
    }

    return (
        <div className="Deck">
            {deck ? (
                <button onClick={toggleAutoDraw}>
                    {autoDraw ? "Stop" : "Start"} Auto Draw
                </button>
            ) : null}
            <button onClick={() => draw()}>Draw!</button>
            <div>{cards}</div>
        </div>
    );
}

export default Deck;
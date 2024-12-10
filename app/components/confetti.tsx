import { confetti } from "@tsparticles/confetti";
import { useEffect } from "react";


function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
const Confetti = () => {
    useEffect(() => {
        confetti({
            angle: randomInRange(55, 125),
            spread: randomInRange(50, 70),
            particleCount: randomInRange(50, 100),
            origin: { y: 0.6 },
          });
    })
    return <></>
}
export { Confetti };
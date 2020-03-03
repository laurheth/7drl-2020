const random = {
    random() {
        let number; // will be filled with a value from 0 to 1
        // I'm not sure how widely available crypto.getRandomValues is?
        // Use it if possible, but if it breaks, just use Math.random
        // Honestly though, it's probably about as widely available as CSS grid, so not sure why I'm worrying
        try {
            number = window.crypto.getRandomValues(new Uint8Array(1))[0]/256;
        }
        catch {
            number = Math.random();
        }
        return number;
    },
    range(min,max) {
        if (min > max) {
            return min;
        }
        let result = Math.floor(this.random() * (1 + max - min)) + min;
        // console.log('range: ', min, result, max);
        return result;
    },
    selection(array) {
        const index = this.range(0,array.length-1);
        return array[index];
    },
    // Assumes an object with format
    // {a:10, b:20, c:6} where numbers == weights
    weighted(object) {
        const keys = Object.keys(object);
        const total = keys.reduce((acc,key) => acc + object[key], 0);
        const chosenValue = this.range(0,total);
        let chosenItem=0;
        for (let i=0; i<keys.length;i++) {
            chosenItem = i;
            chosenValue -= object[keys[chosenItem]];
            if (chosenValue <= 0) {
                break;
            }
        }
        return object[keys[chosenItem]];
    }
}

export default random;
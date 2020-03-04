const actionQueue = {
    index: 0,
    list: [],
    detectErrors: 0,
    advance() {
        this.index++;
        if (this.index >= this.list.length) {
            this.index=0;
        }
        this.act();
    },
    act() {
        this.list[this.index].act();
    },
    add(entity) {
        this.list.push(entity);
    },
    remove(entity) {
        const itemIndex = this.list.indexOf(entity);
        if (itemIndex>=0) {
            if (itemIndex === this.index) {
                this.index--;
            }
            this.list.splice(itemIndex,1);
        }
    },
    current() {
        if (this.list.length>0) {
            return this.list[this.index];
        }
        else {
            return null;
        }
    }
}

export default actionQueue;
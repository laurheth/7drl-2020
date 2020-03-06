import animator from './animator.js';

const actionQueue = {
    index: 0,
    list: [],
    detectErrors: 0,
    stopped: false,
    locks:[],
    advance() {
        if (!this.stopped) {
            this.index++;
            if (this.index >= this.list.length) {
                this.index=0;
            }
            this.act();
        }
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
            if (itemIndex <= this.index) {
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
    },
    stop() {
        this.stopped=true;
    },
    addLock(lock) {
        if (lock !== null) {
            this.stopped=true;
        }
        if (this.locks.indexOf(lock)<0) {
            this.locks.push(lock);
        }
    },
    removeLock(lock) {
        const index=this.locks.indexOf(lock);
        if (index>=0) {
            this.locks.splice(index,1);
        }
        if (this.locks.length<=0) {
            this.stopped=false;
            this.act();
        }
    }
}

export default actionQueue;
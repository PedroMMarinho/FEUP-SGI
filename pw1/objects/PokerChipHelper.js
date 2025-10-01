import * as THREE from 'three';
import { PokerChip } from './PokerChip.js';
import { ChipTower} from './ChipTower.js';

export const PokerChipValue = {
    TWENTY_FIVE: 0,
    FIFTY: 1,
    ONE_HUNDRED: 2,
    FIVE_HUNDRED: 3
};

export class PokerChipHelper{
    constructor(){
        this.singleChips = [];
        this.chipTowers = [];
        this.initMaterials();
    }
    initMaterials(){
        this.chipTopMaterials = []
        this.chipSideMaterials = []
        for (let i = 0; i < 4; i++) {
            let sideTexture = new THREE.TextureLoader().load(`textures/chipSide${i}.png`);
            sideTexture.wrapS = THREE.RepeatWrapping;
            sideTexture.wrapT = THREE.RepeatWrapping;
            sideTexture.repeat.set(6, 1);
            this.chipSideMaterials.push(new THREE.MeshPhongMaterial({ map: sideTexture }));

            let topTexture = new THREE.TextureLoader().load(`textures/chipTop${i}.png`);
            topTexture.wrapS = THREE.RepeatWrapping;
            topTexture.wrapT = THREE.RepeatWrapping;
            topTexture.repeat.set(1, 1);
            this.chipTopMaterials.push(new THREE.MeshPhongMaterial({ map: topTexture }));

        }
    }


    createSingle(x,y,z,pokerChipValue, ang = 0){
        const chip = new PokerChip(x,y,z,ang);
        chip.build(this.chipTopMaterials[pokerChipValue],this.chipSideMaterials[pokerChipValue]);
        this.singleChips.push(chip);
        return chip;
    }

    createTower(x,y,z,pokerChipValue,nChips,ang = 0){
        const chipTower = new ChipTower(x,y,z, ang);
        console.log(pokerChipValue)
        console.log(this.chipTopMaterials[pokerChipValue])
        chipTower.build(nChips,this.chipTopMaterials[pokerChipValue],this.chipSideMaterials[pokerChipValue]);
        this.chipTowers.push(chipTower);
        return chipTower;
    }

    getSingles(){
        return this.singleChips;
    }
    getTowers(){
        return this.chipTowers;
    }
}
import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = new MyAxis(this);
        this.showAxis = true;
    }

    /**
     * initializes the contents
     */
    init() {
        this.app.scene.add(this.axis);
    }


    enableAxis(value){
        this.axis.visible = value;
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };

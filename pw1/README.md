# SGI 2025/2026

## Group T06G04
| Name                 | Number    | E-Mail                        |
| -------------------- | --------- | ----------------------------- |
| Sérgio Nossa         | 202206856 | up202206856@fe.up.pt          |
| Pedro Marinho        | 202206854 | up202206854@fe.up.pt          |
| Ismael Moniz         | 202206871 | up202206871@fe.up.pt          |

----

## Projects

### [PW1 - ThreeJS Basics](pw1)

#### Task A

**Questions**
- Did you observe any differences when changing the order of the lines manipulating the transformations ?

**Surprisingly** there are no differences. If we reverse the order of the transformations we will get the same result. This happens because **Mesh objects**, internally , have a fixed transformation order. In this case it behaves like this:  

- **Scale → Rotation → Position**

The following images show no difference at all after changing the order of the lines of code.

Rotation of 30º then scale:

![Pw1-A-1](assets/PW1-A.png)

Scale then rotation of 30º:

![Pw1-A-2](assets/PW1-A.png)

#### Task B 

**Questions?** 

- What were the differences between setting the rotation property and calling the rotateX() function? Did it behave as it would in WebGL/WebCGF?



When using duplicating the `rotateX()` function line instead of the one where the rotation is assigned, we observed that, in the first case, the rotation is applied twice and only once in the latter. This happens because in the second case we are setting a static value for the rotation and in the first we are rotating the object by a static amount according to its internal rotation. 

The object when using the `rotateX()` function twice: 

![PW1-B](assets/PW1-B.png)

The behavior of `rotateX()` in **three.js** doesn't match the behavior of the `rotate()` function in **WebCGF** as `rotate()` applies a rotation matrix on the global transformation matrix and, as so, the object is rotated around the origin. Meanwhile, `rotateX()` rotates the object in local space. 





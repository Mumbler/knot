/*!
 * Copyright MagnusIT GmbH 2018 - All rights reserved
 */

import { AfterContentInit, Directive, ElementRef, HostListener, Input, isDevMode, OnDestroy } from '@angular/core';
import { BufferGeometry, Color, Group, Line, LineBasicMaterial, MathUtils as ThreeMath, PerspectiveCamera, Scene, Vector3, Vector4, WebGLRenderer } from 'three';

@Directive( {
    selector : '[mitMumble]'

} )
export class MumbleDirective implements OnDestroy, AfterContentInit  {

    private readonly _element : HTMLElement;
    private readonly _renderer : WebGLRenderer = new WebGLRenderer( { antialias: true } );

    private readonly _scene : Scene = new Scene();
    private readonly _camera : PerspectiveCamera = new PerspectiveCamera();

    private readonly _knotGroup : Group = new Group();

    private _needsUpdate : boolean = true;  // initial render cycle

    // Parameter
    private _width : number = 250;
    private _height : number = 250;
    private _controlPoints : number = 50;
    private _mumbleWidth : number = 100;


    public constructor ( private readonly _container: ElementRef ) {

        this._element = this._container.nativeElement;

        this._scene.add( this._knotGroup );

    }

    @Input()
    public set width ( value: number ) {

        this._width = value;

        this.computeKnots();

    }

    @Input()
    public set height ( value: number ) {

        this._height = value;

        this.computeKnots();

    }

    @Input( 'knots' )
    public set controlPoints ( value: number ) {

        this._controlPoints = Math.max( 2, value ) * 2;

        this.computeKnots();

    }

    @Input()
    public set mumbleWidth ( value: number ) {

        this._mumbleWidth = Math.max( 1, Math.min( value, this._width * .9 ) );

        this.computeKnots();

    }

    public ngOnDestroy (): void {

        this._renderer.dispose();

    }

    public ngAfterContentInit (): void {

        // Update the renderer dimensions
        this.updateRendererDimensions();

        // Associate the container Element with the renderer
        this._element.appendChild( this._renderer.domElement );

        // Basic setup of the renderer
        this._renderer.setClearColor( new Color( 0xFFFFFF ) );

        // Setup the camera
        this.setupCamera();

        // Compute the knot
        this.computeKnots();

        // Start the animation loop
        this.animate();

    }

    // region *** HostListener ***
    /**
     * Listen for window resize events
     */
    @HostListener( 'window:resize' )
    public onWindowResize (): void {

        // Update dimensions
        this.updateRendererDimensions();

        // After dimension update a re-render is required;
        this.render();

    }
    // endregion

    // region *** ANIMATION-LOOP & RENDERER ***
    public animate () {

        requestAnimationFrame( () => this.animate() );

        if ( this._needsUpdate ) {

            this.render();

            // reset the render signal
            this._needsUpdate = false;

        }

    }

    // Renderer callback
    private render (): void {

        this._renderer.render( this._scene, this._camera );

    }

    /**
     * Handles the setup of WebGLRenderer dimensions
     */
    private updateRendererDimensions (): void {

        this._renderer.setSize(
            this._element.offsetWidth,
            this._element.offsetHeight
        );

        // Set the pixel ratio for the renderer
        this._renderer.setPixelRatio( Math.floor( window.devicePixelRatio ) );

        // Update the camera position
        this.setupCamera();

    }

    /**
     * Computes the aspect ratio of the element in which the camera associated
     *
     * @returns {number}
     */
    private computeAspectRatio (): number {

        return this._element.offsetWidth / this._element.offsetHeight;

    }

    // endregion

    // region *** CAMERA & CONTROLS ***
    /**
     * Setup the camera
     */
    private setupCamera (): void {

        if ( this._camera ) {

            this._camera.fov = 75;
            this._camera.aspect = this.computeAspectRatio();
            this._camera.near = 0.1;
            this._camera.far = 5000;

            this._camera.updateProjectionMatrix();

            this.computeCameraPosition();

        }

    }

    private computeCameraPosition (): void {

        // Vertical FOV angle, subtract some delta
        const v_gamma: number = ( ( this._camera.fov - 10 ) / 2 ) * Math.PI / 180;
        // Horizontal FOV angle, considering aspect ration
        const h_gamma: number = v_gamma * this._camera.aspect;
        // Camera distance based on horizontal FOV
        const h_dist: number = ( this._width / 2 ) / Math.tan( h_gamma );
        // Camera distance based on vertical FOV
        const v_dist: number = ( this._element.offsetHeight / 2 ) / Math.tan( v_gamma );

        // Use maximum of vertical and horizontal distance, add y-offset from 0/0
        this._camera.position.set( 0, 0, Math.max( h_dist, v_dist + this._height ) );

    }
    // endregion


    private clearKnotGroup (): void {

        if ( this._knotGroup.children.length > 0 ) {

            this._knotGroup.children.forEach( child => {

                this._knotGroup.remove( child );

            } );

        }

    }

    private computeKnots () {

        // Clear the gropu
        this.clearKnotGroup();

        const nurbsControlPoints = [];
        const nurbsKnots = [];
        const nurbsDegree = 2;

        for ( let i = 0; i <= nurbsDegree; i ++ ) {

            nurbsKnots.push( 0 );

        }

        const height: number = Math.min( this._height, this._mumbleWidth );

        for ( let i = 0, j = this._controlPoints; i < j; i ++ ) {


            const vP: Vector4 = new Vector4(
                0,
                0,
                0,
                1 // weight of control point: higher means stronger attraction
            );

            // X-component
            if ( i < this._controlPoints * .4 ) {

                // left hand
                vP.setX( Math.random() * ( -this._mumbleWidth * .5 ) );

            } else if ( i > this._controlPoints * .6 ) {

                // right hand
                vP.setX( Math.random() * ( this._mumbleWidth * .5 ) );

            } else {

                // center
                vP.setX( Math.random() * ( this._mumbleWidth * .5 ) * ( Math.random() > .5 ? 1 : -1 ) );

            }

            // Y-component
            if ( i === 0 || i === ( j - 1 ) ) {

                vP.setY( 0 );

            } else {

                vP.setY( Math.random() * ( height * .5 ) * ( Math.random() > .5 ? 1 : -1 ) );

            }

            nurbsControlPoints.push( vP );

            const knot = ( i + 1 ) / ( j - nurbsDegree );

            nurbsKnots.push( ThreeMath.clamp( knot, 0, 1 ) );

        }

        const nurbsCurve = new NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );

        const nurbsGeometry = new BufferGeometry();
        const nurbsPoints: Array<Vector3> = nurbsCurve.getPoints( this._controlPoints * 25 );


        nurbsPoints.unshift( new Vector3( -this._width * .5, 0, 0 ) );
        nurbsPoints.push( new Vector3( this._width * .5, 0, 0 ) );

        nurbsGeometry.setFromPoints( nurbsPoints );

        const nurbsMaterial = new LineBasicMaterial( { color: 0xE7414E, linewidth: 1 } );
        const nurbsLine = new Line( nurbsGeometry, nurbsMaterial );
        nurbsLine.position.set( 0, 0, 0 );
        this._knotGroup.add( nurbsLine );

        this._needsUpdate = true;

    }

}

/*!
 * Copyright MagnusIT GmbH 2018 - All rights reserved
 *
 * Typescript implementation based on the work of `renej` at
 * https://github.com/mrdoob/three.js/blob/master/examples/js/curves/
 *
 * @author renej
 * NURBS utils
 *
 * See NURBSCurve and NURBSSurface.
 */

import { Curve } from 'three';

class NURBSCurve extends Curve< Vector3 > {

    public constructor (
        private readonly _degree: number,
        private readonly _knots: Array< number >,
        private readonly _controlPoints: Array< Vector4 > = [],
        private readonly _startKnot: number = 0,
        private readonly _endKnot: number = _knots.length - 1
    ) {

        super();

    }


    // noinspection JSUnusedGlobalSymbols
    public get controlPoints (): Array<Vector3> {

        const cP = new Array<Vector3>( this._controlPoints.length );

        for ( let i = 0; i < cP.length; i++ ) {

            cP[ i ] = new Vector3( this._controlPoints[ i ].x, this._controlPoints[ i ].y, this._controlPoints[ i ].z );

        }

        return cP;

    }

    public getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

        const u = this._knots[ this._startKnot ] + t * ( this._knots[ this._endKnot ] - this._knots[ this._startKnot ] ); // linear mapping t->u

        // following results in (wx, wy, wz, w) homogeneous point
        const hpoint = NURBSUtils.calcBSplinePoint( this._degree, this._knots, this._controlPoints, u );

        if ( hpoint.w !== 1.0 ) {

            // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
            hpoint.divideScalar( hpoint.w );

        }

        if ( optionalTarget ) {

            optionalTarget.set( hpoint.x, hpoint.y, hpoint.z );

            return optionalTarget;

        } else {

            return new Vector3( hpoint.x, hpoint.y, hpoint.z );

        }

    }

}


class NURBSUtils {

    /**
     * Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.
     *
     * @param p     degree of B-Spline
     * @param U     knot vector
     * @param P     control points (x, y, z, w)
     * @param u     parametric point
     *
     * @returns     point for given u
     */
    public static calcBSplinePoint ( p: number, U: Array< number >, P: Array< Vector4 >, u: number ): Vector4 {

        const span = NURBSUtils.findSpan( p, u, U );
        const N = NURBSUtils.calcBasisFunctions( span, u, p, U );
        const C = new Vector4( 0, 0, 0, 0 );

        for ( let j = 0; j <= p; ++ j ) {

            const point = P[ span - p + j ];
            const Nj = N[ j ];
            const wNj = point.w * Nj;

            C.x += point.x * wNj;
            C.y += point.y * wNj;
            C.z += point.z * wNj;
            C.w += ( point.w ? point.w : 1 ) * Nj;  // XK: Added default weight

        }

        return C;

    }

    /**
     * Finds knot vector span.
     *
     * @param p     degree
     * @param u     parametric value
     * @param U     knot vector
     *
     * @return      the span
     */
    public static findSpan ( p: number, u: number, U: Array< number > ): number {

        const n = U.length - p - 1;

        if ( u >= U[ n ] ) {

            return n - 1;

        }

        if ( u <= U[ p ] ) {

            return p;

        }

        let low = p;
        let high = n;
        let mid = Math.floor( ( low + high ) / 2 );

        while ( u < U[ mid ] || u >= U[ mid + 1 ] ) {

            if ( u < U[ mid ] ) {

                high = mid;

            } else {

                low = mid;

            }

            mid = Math.floor( ( low + high ) / 2 );

        }

        return mid;

    }

    /**
     * Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2
     *
     * @param span      span in which u lies
     * @param u         parametric point
     * @param p         degree
     * @param U         knot vector
     *
     * @return          array[p+1] with basis functions values
     */
    public static calcBasisFunctions ( span: number, u: number, p: number, U: Array<number> ): Array<number> {

        const N = [];
        const left = [];
        const right = [];
        N[ 0 ] = 1.0;

        for ( let j = 1; j <= p; ++ j ) {

            left[ j ] = u - U[ span + 1 - j ];
            right[ j ] = U[ span + j ] - u;

            let saved = 0.0;

            for ( let r = 0; r < j; ++ r ) {

                const rv = right[ r + 1 ];
                const lv = left[ j - r ];
                const temp = N[ r ] / ( rv + lv );
                N[ r ] = saved + rv * temp;
                saved = lv * temp;

            }

            N[ j ] = saved;

        }

        return N;

    }

}

import { Widget, Rect } from './Widget.ts'
import { BinaryOperation } from "./BinaryOperation.ts";
import { DockingPoint } from "./DockingPoint.ts";
import { Relation } from "./Relation.ts";
import { Num } from "./Num.ts";

/** A class for representing variables and constants (aka, elements). */
export
class ChemicalElement extends Widget {

    protected s: any;
    private element: string;

    get typeAsString(): string {
        return "ChemicalElement";
    }

    /**
     * There's a thing with the baseline and all that... this sort-of fixes it.
     *
     * @returns {Vector} The position to which a ChemicalElement is meant to be docked from.
     */
    get dockingPoint(): p5.Vector {
        var box = this.s.font_it.textBounds("x", 0, 1000, this.scale * this.s.baseFontSize);
        return this.p.createVector(0, - box.h / 2);
    }

    constructor(p:any, s:any, element:string) {
        super(p, s);
        this.element = element;
        this.s = s;

        this.docksTo = ['ChemicalElement', 'operator', 'exponent', 'subscript'];
    }

    /**
     * Generates all the docking points in one go and stores them in this.dockingPoints.
     * A ChemicalElement has three docking points:
     *
     * - _right_: Binary operation (addition, subtraction), ChemicalElement (multiplication)
     * - _superscript_: Exponent
     * - _subscript_: Subscript (duh?)
     */
    generateDockingPoints() {
        var box = this.boundingBox();
        var descent = this.position.y - (box.y + box.h);

        this.dockingPoints["right"] = new DockingPoint(this, this.p.createVector(box.w / 2 + this.s.mBox.w / 4, -this.s.xBox.h / 2), 1, "operator", "right");
        this.dockingPoints["superscript"] = new DockingPoint(this, this.p.createVector(box.w / 2 + this.scale * 20, -this.scale*this.s.mBox.h), 0.666, "exponent", "superscript");
        this.dockingPoints["subscript"] = new DockingPoint(this, this.p.createVector(box.w / 2 + this.scale * 20, descent), 0.666, "subscript", "subscript");
    }

    /**
     * Generates the expression corresponding to this widget and its subtree.
     *
     * The `subscript` format is a special one for generating symbols that will work with the sympy checker. It squashes
     * everything together, ignoring operations and all that jazz.
     *
     * @param format A string to specify the output format. Supports: latex, python, subscript.
     * @returns {string} The expression in the specified format.
     */
    getExpression(format: string): string {
        var expression = "";
        if (format == "latex") {
            expression = this.element;
            if (this.dockingPoints["superscript"].child != null) {
                expression += "^{" + this.dockingPoints["superscript"].child.getExpression(format) + "}";
            }
            if (this.dockingPoints["subscript"].child != null) {
                expression += "_{" + this.dockingPoints["subscript"].child.getExpression(format) + "}";
            }
            if (this.dockingPoints["right"].child != null) {
                if (this.dockingPoints["right"].child instanceof BinaryOperation) {
                    expression += this.dockingPoints["right"].child.getExpression(format);
                } else {
                    // WARNING This assumes it's a ChemicalElement, hence produces a multiplication
                    expression += this.dockingPoints["right"].child.getExpression(format);
                }
            }
        } else if (format == "python") {
            expression = "" + this.element;
            if (this.dockingPoints["subscript"].child != null) {
                expression += "_"+this.dockingPoints["subscript"].child.getExpression("subscript");
            }
            if (this.dockingPoints["superscript"].child != null) {
                expression += "**(" + this.dockingPoints["superscript"].child.getExpression(format) + ")";
            }
            if (this.dockingPoints["right"].child != null) {
                if (this.dockingPoints["right"].child instanceof BinaryOperation ||
                    this.dockingPoints["right"].child instanceof Relation) {
                    expression += this.dockingPoints["right"].child.getExpression(format);
                } else if(this.dockingPoints["right"].child instanceof Num && (<Num>this.dockingPoints["right"].child).isNegative()) {
                    expression += this.dockingPoints["right"].child.getExpression(format);
                } else {
                    // WARNING This assumes it's a ChemicalElement by default, hence produces a multiplication (with a star)
                    expression += "*" + this.dockingPoints["right"].child.getExpression(format);
                }
            }
        } else if (format == "subscript") {
            expression = "" + this.element;
            if (this.dockingPoints["subscript"].child != null) {
                expression += this.dockingPoints["subscript"].child.getExpression(format);
            }
            if (this.dockingPoints["superscript"].child != null) {
                expression += this.dockingPoints["superscript"].child.getExpression(format);
            }
            if (this.dockingPoints["right"].child != null) {
                expression += this.dockingPoints["right"].child.getExpression(format);
            }
        } else if(format == "mathml") {
            expression = '';
            if(this.dockingPoints['subscript'].child == null && this.dockingPoints['superscript'].child == null) {
                expression += '<mi>' + this.element + '</mi>';

            } else if(this.dockingPoints['subscript'].child != null && this.dockingPoints['superscript'].child == null) {
                expression += '<msub><mi>' + this.element + '</mi><mrow>' + this.dockingPoints['subscript'].child.getExpression(format) + '</mrow></msub>';

            } else if(this.dockingPoints['subscript'].child == null && this.dockingPoints['superscript'].child != null) {
                expression += '<msup><mi>' + this.element + '</mi><mrow>' + this.dockingPoints['superscript'].child.getExpression(format) + '</mrow></msup>';

            } else if(this.dockingPoints['subscript'].child != null && this.dockingPoints['superscript'].child != null) {
                expression += '<msubsup><mi>' + this.element + '</mi><mrow>' + this.dockingPoints['subscript'].child.getExpression(format) + '</mrow><mrow>' + this.dockingPoints['superscript'].child.getExpression(format) + '</mrow></msubsup>';

            }
            if(this.dockingPoints['right'].child != null) {
                expression += this.dockingPoints['right'].child.getExpression('mathml');
            }
        }
       
        return expression;
    }

    properties(): Object {
        return {
            element: this.element
        };
    }

    token() {
        // TODO Handle greek elements
        var e = this.element;
        if(this.dockingPoints['subscript'].child) {
            e += '_' + this.dockingPoints['subscript'].child.getExpression('subscript');
        }
        return e;
    }

    /** Paints the widget on the canvas. */
    _draw() {
        this.p.fill(this.color).strokeWeight(0).noStroke();

        this.p.textFont(this.s.font_up)
            .textSize(this.s.baseFontSize * this.scale)
            .textAlign(this.p.CENTER, this.p.BASELINE)
            .text(this.element, 0, 0);
        this.p.strokeWeight(1);

        if (window.location.hash === "#debug") {
            this.p.stroke(255, 0, 0).noFill();
            this.p.ellipse(0, 0, 10, 10);
            this.p.ellipse(0, 0, 5, 5);

            this.p.stroke(0, 0, 255).noFill();
            this.p.ellipse(this.dockingPoint.x, this.dockingPoint.y, 10, 10);
            this.p.ellipse(this.dockingPoint.x, this.dockingPoint.y, 5, 5);
        }
    }

    /**
     * This widget's tight bounding box. This is used for the cursor hit testing.
     *
     * @returns {Rect} The bounding box
     */
    boundingBox(): Rect {
        var box = this.s.font_it.textBounds(this.element || "x", 0, 1000, this.scale * this.s.baseFontSize);
        return new Rect(-box.w / 2, box.y - 1000, box.w, box.h);
    }

    /**
     * Internal companion method to shakeIt(). This is the one that actually does the work, and the one that should be
     * overridden by children of this class.
     *
     * @private
     */
    _shakeIt() {
        // Work out the size of all our children
        var boxes: {[key:string]: Rect} = {};

        _.each(this.dockingPoints, (dockingPoint, dockingPointName) => {
            if (dockingPoint.child != null) {
                dockingPoint.child.scale = this.scale * dockingPoint.scale;
                dockingPoint.child._shakeIt();
                boxes[dockingPointName] = dockingPoint.child.boundingBox(); // NB: This only looks at the direct child!
            }
        });

        // Calculate our own geometry

        // Nothing to do for ChemicalElement

        // Set position of all our children.

        var box = this.boundingBox();
        var descent = (box.y + box.h);

        var widest = 0;

        if ("superscript" in boxes) {
            var p = this.dockingPoints["superscript"].child.position;
            var offsetBox = this.dockingPoints["superscript"].child.offsetBox();
            var w = offsetBox.w;
            var childDescent = offsetBox.y + offsetBox.h;
            widest = this.dockingPoints["superscript"].child.subtreeBoundingBox().w;
            p.x = (box.w + w)/2;
            p.y = 0 - this.s.mBox.h*this.scale;
        } else {
            var p = this.dockingPoints["superscript"].position;
            p.x = (box.w + this.s.xBox.w)/2;
            p.y = -this.s.mBox.h*this.scale;
        }

        if ("subscript" in boxes) {
            var p = this.dockingPoints["subscript"].child.position;
            var w = this.dockingPoints["subscript"].child.offsetBox().w;
            widest = Math.max(this.dockingPoints["subscript"].child.subtreeBoundingBox().w, widest);
            p.x = box.w / 2 + this.scale * 20 + w/2;
            p.y = this.scale * this.s.mBox.w / 4;
        } else {
            var p = this.dockingPoints["subscript"].position;
            p.x = box.w / 2 + this.scale * 20;
            p.y = descent;
        }

        // TODO: Tweak this with kerning.
        if ("right" in boxes) {
            var p = this.dockingPoints["right"].child.position;
            p.x = box.w / 2 + this.scale * this.s.mBox.w / 4 + widest + this.dockingPoints["right"].child.offsetBox().w/2;
            p.y = 0;
        } else {
            var p = this.dockingPoints["right"].position;
            p.x = box.w / 2 + this.scale * this.s.mBox.w / 4 + widest;
            p.y = -this.s.xBox.h / 2;
        }
    }

    /**
     * @returns {Widget[]} A flat array of the children of this widget, as widget objects
     */
    getChildren(): Array<Widget> {
        return _.compact(_.pluck(_.values(_.omit(this.dockingPoints, "subscript")), "child"));
    }
}
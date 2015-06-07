/// <reference path="references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
if (typeof __decorate !== "function") __decorate = function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
if (typeof __metadata !== "function") __metadata = function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// TODO
// * Add an actual ISelectable
// * Some sort of Math.flooring x/y normalizer
// * Separate out note description sidebar and make that selectable, maybe?
// * Start moving stuff into different files.
var C = (function () {
    function C() {
    }
    C.NoteWidth = 40;
    C.NoteHeight = 15;
    return C;
})();
var Depths = (function () {
    function Depths() {
    }
    Depths.GridDepth = 0;
    Depths.NoteDepth = 10;
    return Depths;
})();
var NoteUIState = (function (_super) {
    __extends(NoteUIState, _super);
    function NoteUIState() {
        _super.apply(this, arguments);
        this.selected = false;
        this.clicked = false;
    }
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteUIState.prototype, "selected");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteUIState.prototype, "clicked");
    return NoteUIState;
})(Base);
var NoteModel = (function (_super) {
    __extends(NoteModel, _super);
    function NoteModel() {
        _super.apply(this, arguments);
        this.uiState = new NoteUIState();
        this.length = 0;
        this.start = 0;
        this.octave = 4;
        this.key = "A";
    }
    Object.defineProperty(NoteModel.prototype, "x", {
        get: function () { return this.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "y", {
        get: function () { return this.octave * NoteModel.keysInOctave.length + NoteModel.keysInOctave.indexOf(this.key); },
        enumerable: true,
        configurable: true
    });
    NoteModel.getAllNotes = function () {
        var result = [];
        var keys = NoteModel.keysInOctave;
        for (var i = 1; i < 8; i++) {
            for (var j = 0; j < keys.length; j++) {
                result.push("" + keys[j] + i);
            }
        }
        return result;
    };
    /*
      Validate that `key` is actually a real key. No flats sorry.
    */
    NoteModel.validateKey = function (key) {
        return NoteModel.keysInOctave.indexOf(key.toUpperCase()) !== -1;
    };
    NoteModel.prototype.validateOctave = function (octave) {
        // TODO
        return true;
    };
    NoteModel.keysInOctave = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteModel.prototype, "uiState");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteModel.prototype, "length");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteModel.prototype, "start");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteModel.prototype, "octave");
    __decorate([
        validatedProp(NoteModel.validateKey), 
        __metadata('design:type', String)
    ], NoteModel.prototype, "key");
    return NoteModel;
})(Base);
var PianoRollModel = (function (_super) {
    __extends(PianoRollModel, _super);
    function PianoRollModel() {
        _super.apply(this, arguments);
        this.canvasWidth = 600;
        this.canvasHeight = 600;
    }
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], PianoRollModel.prototype, "canvasWidth");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], PianoRollModel.prototype, "canvasHeight");
    return PianoRollModel;
})(Base);
var NoteViewModel = (function (_super) {
    __extends(NoteViewModel, _super);
    function NoteViewModel() {
        _super.apply(this, arguments);
        this.notes = [];
        this.depth = Depths.NoteDepth;
    }
    Object.defineProperty(NoteViewModel.prototype, "hoveredNotes", {
        get: function () {
            return this.notes.filter(function (note) { return note.uiState.selected; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteViewModel.prototype, "clickedNotes", {
        get: function () {
            return this.notes.filter(function (note) { return note.uiState.clicked; });
        },
        enumerable: true,
        configurable: true
    });
    /**
      Returns the note at (x, y) (normalized to grid positions) or undefined
      if there isn't one.
    */
    NoteViewModel.prototype.getNoteAt = function (x, y) {
        var normalizedX = Math.floor(x / C.NoteWidth);
        var normalizedY = Math.floor(y / C.NoteHeight);
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (normalizedX >= note.x && normalizedX < note.x + note.length && note.y == normalizedY) {
                return new Maybe(note);
            }
        }
        return new Maybe();
    };
    NoteViewModel.prototype.deselectAllNotes = function () {
        this.hoveredNotes.map(function (note) { return note.uiState.selected = false; });
    };
    NoteViewModel.prototype.unclickAllNotes = function () {
        this.clickedNotes.map(function (note) { return note.uiState.clicked = false; });
    };
    //
    // ISelectableThing
    //
    NoteViewModel.prototype.hasSomethingToHoverOverAt = function (x, y) {
        return this.getNoteAt(x, y).hasValue;
    };
    NoteViewModel.prototype.hoverOver = function (x, y) {
        // Deselect any old selected note(s)
        this.deselectAllNotes();
        // Select new note
        var note = this.getNoteAt(x, y);
        if (note.hasValue) {
            note.value.uiState.selected = true;
        }
    };
    NoteViewModel.prototype.unhover = function () {
        this.deselectAllNotes();
    };
    //
    // IClickable
    //
    NoteViewModel.prototype.hasSomethingToClickAt = function (x, y) {
        return this.getNoteAt(x, y).hasValue;
    };
    NoteViewModel.prototype.click = function (x, y) {
        var note = this.getNoteAt(x, y);
        if (note.hasValue) {
            note.value.uiState.clicked = true;
        }
    };
    NoteViewModel.prototype.removeFocus = function () {
    };
    __decorate([
        prop, 
        __metadata('design:type', Array)
    ], NoteViewModel.prototype, "notes");
    return NoteViewModel;
})(Base);
var NoteView = (function (_super) {
    __extends(NoteView, _super);
    function NoteView() {
        _super.call(this);
        this.model = new NoteViewModel();
        var note1 = new NoteModel();
        note1.key = "A";
        note1.octave = 0;
        note1.length = 2;
        note1.start = 2;
        var note2 = new NoteModel();
        note2.key = "B";
        note2.octave = 0;
        note2.length = 4;
        note2.start = 3;
        this.model.notes.push(note1);
        this.model.notes.push(note2);
    }
    //
    // IRenderable
    //
    NoteView.prototype.render = function (context) {
        var model = this.model;
        // Draw notes
        for (var _i = 0, _a = model.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (note.uiState.clicked) {
                context.fillStyle = "rgb(150, 0, 0)";
            }
            else if (note.uiState.selected) {
                context.fillStyle = "rgb(255, 100, 100)";
            }
            else {
                context.fillStyle = "rgb(255, 0, 0)";
            }
            context.fillRect(C.NoteWidth * note.x, C.NoteHeight * note.y, C.NoteWidth * note.length, C.NoteHeight);
        }
    };
    return NoteView;
})(Base);
var GridModel = (function (_super) {
    __extends(GridModel, _super);
    function GridModel() {
        _super.apply(this, arguments);
        this.widthInNotes = 40;
        this.heightInNotes = 20;
        // Selection related properties
        this.hasSelection = false;
        this.selectionX = -1;
        this.selectionY = -1;
        this.depth = Depths.GridDepth;
    }
    //
    // ISelectableThing
    //
    GridModel.prototype.hasSomethingToHoverOverAt = function (x, y) {
        return true;
    };
    GridModel.prototype.hoverOver = function (x, y) {
        // Deselect any old selected note(s)
        this.hasSelection = true;
        this.selectionX = Math.floor(x / C.NoteWidth);
        this.selectionY = Math.floor(y / C.NoteHeight);
    };
    GridModel.prototype.unhover = function () {
        this.hasSelection = false;
    };
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], GridModel.prototype, "widthInNotes");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], GridModel.prototype, "heightInNotes");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], GridModel.prototype, "hasSelection");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], GridModel.prototype, "selectionX");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], GridModel.prototype, "selectionY");
    return GridModel;
})(Base);
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        _super.apply(this, arguments);
        this.model = new GridModel();
    }
    //
    // IRenderable
    //
    GridView.prototype.render = function (context) {
        var model = this.model;
        // Draw grid
        for (var i = 0; i < model.widthInNotes; i++) {
            for (var j = 0; j < model.heightInNotes; j++) {
                context.strokeRect(i * C.NoteWidth, j * C.NoteHeight, C.NoteWidth, C.NoteHeight);
            }
        }
        if (this.model.hasSelection) {
            context.fillStyle = "rgb(200, 200, 200)";
            context.fillRect(C.NoteWidth * this.model.selectionX, C.NoteHeight * this.model.selectionY, C.NoteWidth, C.NoteHeight);
        }
    };
    return GridView;
})(Base);
// TODO
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?
var PianoRollView = (function (_super) {
    __extends(PianoRollView, _super);
    function PianoRollView() {
        _super.call(this);
        var gridView = new GridView();
        var noteView = new NoteView();
        this.hoverableThings = [noteView.model, gridView.model];
        this.drawableThings = [noteView, gridView];
        this.clickableThings = [noteView.model];
        this.model = new PianoRollModel();
        this.canvas = document.getElementById("main");
        this.context = this.canvas.getContext('2d');
        this.setUpCanvas();
        window.requestAnimationFrame(this.render);
    }
    PianoRollView.prototype.setUpCanvas = function () {
        var _this = this;
        this.canvas.width = this.model.canvasWidth;
        this.canvas.height = this.model.canvasHeight;
        this.context.translate(0.5, 0.5);
        this.canvas.addEventListener("mousemove", function (ev) {
            _this.mouseMove(ev.offsetX, ev.offsetY);
        });
        this.canvas.addEventListener("mousedown", function (ev) {
            _this.mouseDown(ev.offsetX, ev.offsetY);
        });
    };
    PianoRollView.prototype.mouseDown = function (x, y) {
        for (var _i = 0, _a = this.clickableThings; _i < _a.length; _i++) {
            var thing = _a[_i];
            if (thing.hasSomethingToClickAt(x, y)) {
                thing.click(x, y);
                break;
            }
        }
    };
    PianoRollView.prototype.mouseMove = function (x, y) {
        for (var _i = 0, _a = this.hoverableThings; _i < _a.length; _i++) {
            var thing = _a[_i];
            if (thing.hasSomethingToHoverOverAt(x, y)) {
                // Select the new thing.
                thing.hoverOver(x, y);
                // Deselect the previous thing, if there was one.
                if (this.currentlySelectedThing && this.currentlySelectedThing != thing) {
                    this.currentlySelectedThing.unhover();
                }
                this.currentlySelectedThing = thing;
                break;
            }
        }
    };
    // TODO: Once I separate out the grid class, instead of using C.NoteBleh, put that onto the grid model
    PianoRollView.prototype.render = function () {
        var model = this.model;
        this.context.clearRect(0, 0, this.model.canvasWidth, this.model.canvasHeight);
        // Draw children
        for (var i = 0; i < this.drawableThings.length; i++) {
            this.drawableThings[i].render(this.context);
        }
        // Draw note descriptions
        var noteNames = NoteModel.getAllNotes();
        // TODO: heightInNotes hardcode.
        for (var j = 0; j < 20; j++) {
            this.context.strokeText(noteNames[j], 5, j * C.NoteHeight - 5);
        }
        window.requestAnimationFrame(this.render);
    };
    return PianoRollView;
})(Base);
var test = new PianoRollModel();
document.addEventListener("DOMContentLoaded", function (ev) {
    var pianoRoll = new PianoRollView();
});

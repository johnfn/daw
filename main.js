/// <reference path="references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var C = (function () {
    function C() {
    }
    C.NoteWidth = 40;
    C.NoteHeight = 15;
    return C;
})();
var NoteUIState = (function (_super) {
    __extends(NoteUIState, _super);
    function NoteUIState() {
        _super.apply(this, arguments);
        this._selected = false;
    }
    Object.defineProperty(NoteUIState.prototype, "selected", {
        get: function () { return this._selected; },
        set: function (value) { this._selected = value; },
        enumerable: true,
        configurable: true
    });
    return NoteUIState;
})(Base);
var NoteModel = (function (_super) {
    __extends(NoteModel, _super);
    function NoteModel() {
        _super.apply(this, arguments);
        this._uiState = new NoteUIState();
        this._length = 0;
        this._start = 0;
        this._key = "A";
        this._octave = 4;
    }
    Object.defineProperty(NoteModel.prototype, "uiState", {
        get: function () { return this._uiState; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "length", {
        get: function () { return this._length; },
        set: function (value) { this._length = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "start", {
        get: function () { return this._start; },
        set: function (value) { this._start = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "key", {
        get: function () { return this._key; },
        set: function (value) {
            if (!this.validateKey(value)) {
                console.warn("Invalid key " + value + " passed to NoteModel.");
                return;
            }
            this._key = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "octave", {
        get: function () { return this._octave; },
        set: function (value) { this._octave = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "x", {
        get: function () { return this.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteModel.prototype, "y", {
        get: function () {
            return this.octave * NoteModel.keysInOctave().length + NoteModel.keysInOctave().indexOf(this.key);
        },
        enumerable: true,
        configurable: true
    });
    NoteModel.keysInOctave = function () {
        return ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    };
    NoteModel.getAllNotes = function () {
        var result = [];
        var keys = NoteModel.keysInOctave();
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
    NoteModel.prototype.validateKey = function (key) {
        return NoteModel.keysInOctave().indexOf(key.toUpperCase()) !== -1;
    };
    NoteModel.prototype.validateOctave = function (octave) {
        // TODO
        return true;
    };
    return NoteModel;
})(Base);
var PianoRollModel = (function (_super) {
    __extends(PianoRollModel, _super);
    function PianoRollModel() {
        _super.apply(this, arguments);
        this._widthInNotes = 20;
        this._heightInNotes = 20;
        this._canvasWidth = 600;
        this._canvasHeight = 600;
    }
    Object.defineProperty(PianoRollModel.prototype, "widthInNotes", {
        get: function () { return this._widthInNotes; },
        set: function (value) { this._widthInNotes = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PianoRollModel.prototype, "heightInNotes", {
        get: function () { return this._heightInNotes; },
        set: function (value) { this._heightInNotes = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PianoRollModel.prototype, "canvasWidth", {
        get: function () { return this._canvasWidth; },
        set: function (value) { this._canvasWidth = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PianoRollModel.prototype, "canvasHeight", {
        get: function () { return this._canvasHeight; },
        set: function (value) { this._canvasHeight = value; },
        enumerable: true,
        configurable: true
    });
    return PianoRollModel;
})(Base);
var NoteViewModel = (function (_super) {
    __extends(NoteViewModel, _super);
    function NoteViewModel() {
        _super.apply(this, arguments);
        this._noteWidth = C.NoteWidth;
        this._noteHeight = C.NoteHeight;
        this._notes = [];
    }
    Object.defineProperty(NoteViewModel.prototype, "noteWidth", {
        get: function () { return this._noteWidth; },
        set: function (value) { this._noteWidth = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteViewModel.prototype, "noteHeight", {
        get: function () { return this._noteHeight; },
        set: function (value) { this._noteHeight = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NoteViewModel.prototype, "notes", {
        get: function () { return this._notes; },
        enumerable: true,
        configurable: true
    });
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
        note1.length = 3;
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
    // IDrawableThing
    //
    NoteView.prototype.render = function (context) {
        var model = this.model;
        // Draw notes
        for (var i = 0; i < model.notes.length; i++) {
            var note = model.notes[i];
            if (note.uiState.selected) {
                context.fillStyle = "rgb(255, 100, 100)";
            }
            else {
                context.fillStyle = "rgb(255, 0, 0)";
            }
            context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth, model.noteHeight);
        }
    };
    //
    // ISelectableThing
    //
    // TODO: Decompose out a "find note w/ (x, y)"
    // TODO: should consider note start and end positions
    NoteView.prototype.hasSomethingToSelectAt = function (x, y) {
        var model = this.model;
        var normalizedX = Math.floor(x / model.noteWidth);
        var normalizedY = Math.floor(y / model.noteHeight);
        for (var i = 0; i < this.model.notes.length; i++) {
            var note = this.model.notes[i];
            if (note.x == normalizedX && note.y == normalizedY) {
                return true;
            }
        }
        return false;
    };
    NoteView.prototype.selectAt = function (x, y) {
        var model = this.model;
        var normalizedX = Math.floor(x / model.noteWidth);
        var normalizedY = Math.floor(y / model.noteHeight);
        // Deselect any old selected note (TODO could be optimized)
        for (var i = 0; i < this.model.notes.length; i++) {
            var note = this.model.notes[i];
            if (note.uiState.selected) {
                note.uiState.selected = false;
            }
        }
        // Select new note
        for (var i = 0; i < this.model.notes.length; i++) {
            var note = this.model.notes[i];
            if (note.x == normalizedX && note.y == normalizedY) {
                note.uiState.selected = true;
                break;
            }
        }
    };
    NoteView.prototype.deselect = function () {
        console.warn("Stub");
    };
    /**
      How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
    */
    NoteView.prototype.depth = function () {
        return 0;
    };
    // NOTE this is wrong
    /**
      Register this as a selectable thing. Necessary if you want it to actually be selected...
    */
    NoteView.prototype.register = function () {
        console.warn("stub");
    };
    return NoteView;
})(Base);
// TODO
// * ISelectableThing should be implemented on the Model rather than the View.
// * Drawing note stuff should also be moved onto that class.
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?
// * Is there a better for loop
var PianoRollView = (function (_super) {
    __extends(PianoRollView, _super);
    function PianoRollView() {
        _super.call(this);
        var noteView = new NoteView();
        this.selectableThings = [noteView];
        this.drawableThings = [noteView];
        this.model = new PianoRollModel();
        this.canvas = document.getElementById("main");
        this.context = this.canvas.getContext('2d');
        this.setUpCanvas();
        window.requestAnimationFrame(this.render);
    }
    PianoRollView.prototype.getItemAtPoint = function (x, y) {
        // Check notes
    };
    PianoRollView.prototype.setUpCanvas = function () {
        var _this = this;
        this.canvas.width = this.model.canvasWidth;
        this.canvas.height = this.model.canvasHeight;
        this.context.translate(0.5, 0.5);
        this.canvas.addEventListener("mousemove", function (ev) {
            _this.mouseMove(ev.offsetX, ev.offsetY);
        });
    };
    PianoRollView.prototype.mouseMove = function (x, y) {
        for (var i = 0; i < this.selectableThings.length; i++) {
            var thing = this.selectableThings[i];
            if (thing.hasSomethingToSelectAt(x, y)) {
                thing.selectAt(x, y);
                break;
            }
        }
    };
    // TODO: Once I separate out the grid class, instead of using C.NoteBleh, put that onto the grid model
    PianoRollView.prototype.render = function () {
        var model = this.model;
        this.context.clearRect(0, 0, this.model.canvasWidth, this.model.canvasHeight);
        // Draw grid
        for (var i = 0; i < model.widthInNotes; i++) {
            for (var j = 0; j < model.heightInNotes; j++) {
                this.context.strokeRect(i * C.NoteWidth, j * C.NoteHeight, C.NoteWidth, C.NoteHeight);
            }
        }
        // Draw note descriptions
        var noteNames = NoteModel.getAllNotes();
        for (var j = 0; j < model.heightInNotes; j++) {
            this.context.strokeText(noteNames[j], 5, j * C.NoteHeight - 5);
        }
        // Draw notes
        for (var i = 0; i < this.drawableThings.length; i++) {
            this.drawableThings[i].render(this.context);
        }
        window.requestAnimationFrame(this.render);
    };
    return PianoRollView;
})(Base);
var test = new PianoRollModel();
test.widthInNotes = 55;
document.addEventListener("DOMContentLoaded", function (ev) {
    var pianoRoll = new PianoRollView();
});

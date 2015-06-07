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
// * autoprop stuff:
//   * for stuff like key... some sort of set() validator?
// * Separate out grid from MainView and make that selectable, too.
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
        this.selected = false;
    }
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteUIState.prototype, "selected");
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
        this._key = "A";
    }
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
    NoteModel.prototype.validateKey = function (key) {
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
    return NoteModel;
})(Base);
var PianoRollModel = (function (_super) {
    __extends(PianoRollModel, _super);
    function PianoRollModel() {
        _super.apply(this, arguments);
        this.widthInNotes = 20;
        this.heightInNotes = 20;
        this.canvasWidth = 600;
        this.canvasHeight = 600;
    }
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], PianoRollModel.prototype, "widthInNotes");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], PianoRollModel.prototype, "heightInNotes");
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
        this.noteWidth = C.NoteWidth;
        this.noteHeight = C.NoteHeight;
        this.notes = [];
    }
    Object.defineProperty(NoteViewModel.prototype, "selectedNotes", {
        get: function () {
            return this.notes.filter(function (note) { return note.uiState.selected; });
        },
        enumerable: true,
        configurable: true
    });
    /**
      Returns the note at (x, y) (normalized to grid positions) or undefined
      if there isn't one.
    */
    NoteViewModel.prototype.getNoteAt = function (x, y) {
        var normalizedX = Math.floor(x / this.noteWidth);
        var normalizedY = Math.floor(y / this.noteHeight);
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (normalizedX >= note.x && normalizedX < note.x + note.length && note.y == normalizedY) {
                return new Maybe(note);
            }
        }
        return new Maybe();
    };
    //
    // ISelectableThing
    //
    NoteViewModel.prototype.hasSomethingToSelectAt = function (x, y) {
        return this.getNoteAt(x, y).hasValue;
    };
    NoteViewModel.prototype.selectAt = function (x, y) {
        // Deselect any old selected note(s)
        var notes = this.selectedNotes;
        for (var _i = 0; _i < notes.length; _i++) {
            var n = notes[_i];
            n.uiState.selected = false;
        }
        // Select new note
        var note = this.getNoteAt(x, y);
        if (note.hasValue) {
            note.value.uiState.selected = true;
        }
    };
    NoteViewModel.prototype.deselect = function () {
        console.warn("Stub");
    };
    /**
      How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
    */
    NoteViewModel.prototype.depth = function () {
        return 0;
    };
    // NOTE this is the wrong abstraction.
    /**
      Register this as a selectable thing. Necessary if you want it to actually be selected...
    */
    NoteViewModel.prototype.register = function () {
        console.warn("stub");
    };
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteViewModel.prototype, "noteWidth");
    __decorate([
        prop, 
        __metadata('design:type', Object)
    ], NoteViewModel.prototype, "noteHeight");
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
    // IDrawableThing
    //
    NoteView.prototype.render = function (context) {
        var model = this.model;
        // Draw notes
        for (var _i = 0, _a = model.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (note.uiState.selected) {
                context.fillStyle = "rgb(255, 100, 100)";
            }
            else {
                context.fillStyle = "rgb(255, 0, 0)";
            }
            context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth * note.length, model.noteHeight);
        }
    };
    return NoteView;
})(Base);
// TODO
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?
var PianoRollView = (function (_super) {
    __extends(PianoRollView, _super);
    function PianoRollView() {
        _super.call(this);
        var noteView = new NoteView();
        this.selectableThings = [noteView.model];
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
        for (var _i = 0, _a = this.selectableThings; _i < _a.length; _i++) {
            var thing = _a[_i];
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

/// <reference path="references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
var AllNotes = (function (_super) {
    __extends(AllNotes, _super);
    function AllNotes() {
        _super.apply(this, arguments);
        this._list = [];
    }
    Object.defineProperty(AllNotes.prototype, "list", {
        get: function () { return this._list; },
        enumerable: true,
        configurable: true
    });
    AllNotes.prototype.getNoteAt = function (x, y) {
        for (var i = 0; i < this.list.length; i++) {
        }
    };
    return AllNotes;
})(Base);
var SelectionType;
(function (SelectionType) {
    SelectionType[SelectionType["Note"] = 0] = "Note";
    SelectionType[SelectionType["Grid"] = 1] = "Grid";
    SelectionType[SelectionType["None"] = 2] = "None";
})(SelectionType || (SelectionType = {}));
;
var SelectionModel = (function (_super) {
    __extends(SelectionModel, _super);
    function SelectionModel() {
        _super.apply(this, arguments);
        this._type = SelectionType.None;
    }
    Object.defineProperty(SelectionModel.prototype, "type", {
        get: function () { return this._type; },
        set: function (value) { this._type = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "selectedNote", {
        /**
          If selectionTarget == Note, then this will be the selected note.
        */
        get: function () { return this._selectedNote; },
        set: function (value) { this._selectedNote = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "selectedGridX", {
        get: function () { return this._selectedGridX; },
        set: function (value) { this._selectedGridX = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "selectedGridY", {
        get: function () { return this._selectedGridY; },
        set: function (value) { this._selectedGridY = value; },
        enumerable: true,
        configurable: true
    });
    return SelectionModel;
})(Base);
var PianoRollModel = (function (_super) {
    __extends(PianoRollModel, _super);
    function PianoRollModel() {
        _super.apply(this, arguments);
        this._widthInNotes = 20;
        this._heightInNotes = 20;
        this._noteWidth = 40;
        this._noteHeight = 15;
        this._canvasWidth = 600;
        this._canvasHeight = 600;
        this._selectionModel = new SelectionModel();
        this._notes = new AllNotes();
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
    Object.defineProperty(PianoRollModel.prototype, "noteWidth", {
        get: function () { return this._noteWidth; },
        set: function (value) { this._noteWidth = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PianoRollModel.prototype, "noteHeight", {
        get: function () { return this._noteHeight; },
        set: function (value) { this._noteHeight = value; },
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
    Object.defineProperty(PianoRollModel.prototype, "selectionModel", {
        get: function () { return this._selectionModel; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PianoRollModel.prototype, "notes", {
        get: function () { return this._notes; },
        enumerable: true,
        configurable: true
    });
    return PianoRollModel;
})(Base);
//
// * Pull out the note stuff into a NoteView subclass. This should just be some sort of parent and event dispatcher guy.
// * Drawing note stuff should also be moved onto that class.
//
var PianoRollView = (function (_super) {
    __extends(PianoRollView, _super);
    function PianoRollView() {
        _super.call(this);
        this.model = new PianoRollModel();
        this.canvas = document.getElementById("main");
        this.context = this.canvas.getContext('2d');
        this.setUpCanvas();
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
        this.model.notes.list.push(note1);
        this.model.notes.list.push(note2);
        this.model.selectionModel.type = SelectionType.Grid;
        this.model.selectionModel.selectedGridX = 0;
        this.model.selectionModel.selectedGridY = 0;
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
        var model = this.model;
        /*
        var selection = this.model.selectionModel;
    
        selection.type = SelectionType.Grid;
    
        selection.selectedGridX = Math.floor(x / model.noteWidth);
        selection.selectedGridY = Math.floor(y / model.noteHeight);
        */
        console.log(this.hasSomethingToSelectAt(x, y));
    };
    PianoRollView.prototype.render = function () {
        var model = this.model;
        var selection = this.model.selectionModel;
        this.context.clearRect(0, 0, this.model.canvasWidth, this.model.canvasHeight);
        // Draw grid
        for (var i = 0; i < model.widthInNotes; i++) {
            for (var j = 0; j < model.heightInNotes; j++) {
                this.context.strokeRect(i * model.noteWidth, j * model.noteHeight, model.noteWidth, model.noteHeight);
            }
        }
        // Draw selection if necessary
        if (selection.type == SelectionType.Grid) {
            this.context.fillStyle = "rgb(230, 230, 230)";
            this.context.fillRect(model.noteWidth * selection.selectedGridX, model.noteHeight * selection.selectedGridY, model.noteWidth, model.noteHeight);
        }
        // Draw note descriptions
        var noteNames = NoteModel.getAllNotes();
        for (var j = 0; j < model.heightInNotes; j++) {
            this.context.strokeText(noteNames[j], 5, j * model.noteHeight - 5);
        }
        // Draw notes
        for (var i = 0; i < model.notes.list.length; i++) {
            var note = model.notes.list[i];
            this.context.fillStyle = "rgb(255, 0, 0)";
            this.context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth, model.noteHeight);
        }
        window.requestAnimationFrame(this.render);
    };
    //
    // ISelectableThing
    //
    // TODO: should be moved into a note-specific subclass
    // TODO: should consider note start and end positions
    // TODO: Should change F12 to Cmd + y
    PianoRollView.prototype.hasSomethingToSelectAt = function (x, y) {
        var model = this.model;
        var normalizedX = Math.floor(x / model.noteWidth);
        var normalizedY = Math.floor(y / model.noteHeight);
        for (var i = 0; i < this.model.notes.list.length; i++) {
            var note = this.model.notes.list[i];
            console.log("x " + note.x + " y " + note.y);
            console.log("Normalized: x " + normalizedX + " y " + normalizedY);
            if (note.x == normalizedX && note.y == normalizedY) {
                return true;
            }
        }
        return false;
    };
    PianoRollView.prototype.selectAt = function (x, y) {
        console.warn("Stub");
    };
    PianoRollView.prototype.deselect = function () {
        console.warn("Stub");
    };
    /**
      How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
    */
    PianoRollView.prototype.depth = function () {
        return 0;
    };
    // NOTE this is wrong
    /**
      Register this as a selectable thing. Necessary if you want it to actually be selected...
    */
    PianoRollView.prototype.register = function () {
        console.warn("stub");
    };
    return PianoRollView;
})(Base);
var test = new PianoRollModel();
test.listenTo(test, 'change', function () {
    console.log('woo');
});
test.widthInNotes = 55;
document.addEventListener("DOMContentLoaded", function (ev) {
    var pianoRoll = new PianoRollView();
});

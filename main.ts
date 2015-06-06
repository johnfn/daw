/// <reference path="references.d.ts" />

class NoteUIState extends Base {
  private _selected = false;

  get selected(): boolean { return this._selected; }
  set selected(value: boolean) { this._selected = value; }
}

class NoteModel extends Base {
  private _uiState = new NoteUIState();

  get uiState(): NoteUIState { return this._uiState; }

  private _length = 0;

  get length(): number { return this._length; }
  set length(value: number) { this._length = value; }

  private _start = 0;

  get start(): number { return this._start; }
  set start(value: number) { this._start = value; }

  private _key = "A";

  get key(): string { return this._key; }
  set key(value: string) {
    if (!this.validateKey(value)) {
      console.warn(`Invalid key ${value} passed to NoteModel.`);

      return;
    }

    this._key = value;
  }

  private _octave = 4;

  get octave(): number { return this._octave; }
  set octave(value: number) { this._octave = value; }

  get x(): number { return this.start; }

  get y(): number {
    return this.octave * NoteModel.keysInOctave().length + NoteModel.keysInOctave().indexOf(this.key);
  }

  public static keysInOctave(): string[] {
    return ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  }

  public static getAllNotes(): string[] {
    var result:string[] = [];
    var keys = NoteModel.keysInOctave();

    for (var i = 1; i < 8; i++) {
      for (var j = 0; j < keys.length; j++) {
        result.push(`${keys[j]}${i}`);
      }
    }

    return result;
  }

  /*
    Validate that `key` is actually a real key. No flats sorry.
  */
  private validateKey(key: string): boolean {
    return NoteModel.keysInOctave().indexOf(key.toUpperCase()) !== -1;
  }

  private validateOctave(octave: number): boolean {
    // TODO

    return true;
  }
}

class AllNotes extends Base {
  private _list: NoteModel[] = [];

  get list(): NoteModel[] { return this._list; }

  public getNoteAt(x: number, y: number) {
    for (var i = 0; i < this.list.length; i++) {

    }
  }
}

enum SelectionType {
  Note,
  Grid,
  None
};

interface ISelectableThing {
  /**
    x and y are pixel values that have not been normalized (except such that (0, 0) is the top left of the canvas)
  */
  hasSomethingToSelectAt(x: number, y: number): boolean;

  selectAt(x: number, y: number): void;

  deselect(): void;

  /**
    How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
  */
  depth(): number;

  /**
    Register this as a selectable thing. Necessary if you want it to actually be selected...
  */
  register(): void;
}

class SelectionModel extends Base {
  private _type = SelectionType.None;

  get type(): SelectionType { return this._type; }
  set type(value: SelectionType) { this._type = value; }

  private _selectedNote: NoteModel;

  /**
    If selectionTarget == Note, then this will be the selected note.
  */
  get selectedNote(): NoteModel { return this._selectedNote; }
  set selectedNote(value: NoteModel) { this._selectedNote = value; }

  /**
    If selectionTarget == Grid, then this will be the x position of the selected grid cell.
  */
  private _selectedGridX: number;

  get selectedGridX(): number { return this._selectedGridX; }
  set selectedGridX(value: number) { this._selectedGridX = value; }

  /**
    If selectionTarget == Grid, then this will be the y position of the selected grid cell.
  */
  private _selectedGridY: number;

  get selectedGridY(): number { return this._selectedGridY; }
  set selectedGridY(value: number) { this._selectedGridY = value; }
}


class PianoRollModel extends Base {
  private _widthInNotes = 20;

  get widthInNotes(): number { return this._widthInNotes; }
  set widthInNotes(value: number) { this._widthInNotes = value; }

  private _heightInNotes = 20;

  get heightInNotes(): number { return this._heightInNotes; }
  set heightInNotes(value: number) { this._heightInNotes = value; }

  private _noteWidth = 40;

  get noteWidth(): number { return this._noteWidth; }
  set noteWidth(value: number) { this._noteWidth = value; }

  private _noteHeight = 15;

  get noteHeight(): number { return this._noteHeight; }
  set noteHeight(value: number) { this._noteHeight = value; }

  private _canvasWidth = 600;

  get canvasWidth(): number { return this._canvasWidth; }
  set canvasWidth(value: number) { this._canvasWidth = value; }

  private _canvasHeight = 600;

  get canvasHeight(): number { return this._canvasHeight; }
  set canvasHeight(value: number) { this._canvasHeight = value; }

  private _selectionModel = new SelectionModel();

  get selectionModel(): SelectionModel { return this._selectionModel; }

  private _notes: AllNotes = new AllNotes();

  get notes(): AllNotes { return this._notes; }
}


//
// * Pull out the note stuff into a NoteView subclass. This should just be some sort of parent and event dispatcher guy.
// * Drawing note stuff should also be moved onto that class.
//

class PianoRollView extends Base implements ISelectableThing {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private model: PianoRollModel;

  constructor() {
    super();

    this.model = new PianoRollModel();

    this.canvas = <HTMLCanvasElement> document.getElementById("main");
    this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

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

  private getItemAtPoint(x: number, y: number) {
    // Check notes
  }

  private setUpCanvas() {
    this.canvas.width = this.model.canvasWidth;
    this.canvas.height = this.model.canvasHeight;

    this.context.translate(0.5, 0.5);

    this.canvas.addEventListener("mousemove", (ev: MouseEvent) => {
      this.mouseMove(ev.offsetX, ev.offsetY);
    });
  }

  private mouseMove(x: number, y: number) {
    var model = this.model;

    /*
    var selection = this.model.selectionModel;

    selection.type = SelectionType.Grid;

    selection.selectedGridX = Math.floor(x / model.noteWidth);
    selection.selectedGridY = Math.floor(y / model.noteHeight);
    */

    console.log(this.hasSomethingToSelectAt(x, y));
  }

  private render() {
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
      var note: NoteModel = model.notes.list[i];

      this.context.fillStyle = "rgb(255, 0, 0)";
      this.context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth, model.noteHeight);
    }

    window.requestAnimationFrame(this.render);
  }

  //
  // ISelectableThing
  //

  // TODO: should be moved into a note-specific subclass
  // TODO: should consider note start and end positions
  // TODO: Should change F12 to Cmd + y

  hasSomethingToSelectAt(x: number, y: number): boolean {
    var model = this.model;

    var normalizedX = Math.floor(x / model.noteWidth);
    var normalizedY = Math.floor(y / model.noteHeight);

    for (var i = 0; i < this.model.notes.list.length; i++) {
      var note = this.model.notes.list[i];

      console.log(`x ${note.x} y ${note.y}`);
      console.log(`Normalized: x ${normalizedX} y ${normalizedY}`);

      if (note.x == normalizedX && note.y == normalizedY) {
        return true;
      }
    }

    return false;
  }

  selectAt(x: number, y: number): void {
    console.warn("Stub");
  }

  deselect(): void {
    console.warn("Stub");
  }

  /**
    How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
  */
  depth(): number {
    return 0;
  }

  // NOTE this is wrong
  /**
    Register this as a selectable thing. Necessary if you want it to actually be selected...
  */
  register(): void {
    console.warn("stub");
  }
}

var test: PianoRollModel = new PianoRollModel();

test.listenTo(test, 'change', () => {
  console.log('woo');
});

test.widthInNotes = 55;


document.addEventListener("DOMContentLoaded", (ev) => {
  var pianoRoll = new PianoRollView();
});
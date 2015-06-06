/// <reference path="references.d.ts" />

// TODO
//   * Separate out grid from MainView and make that selectable, too.

class C {
  public static NoteWidth = 40;
  public static NoteHeight = 15;
}

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

interface IDrawableThing {
  render(context: CanvasRenderingContext2D): void;
}

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

class PianoRollModel extends Base {
  private _widthInNotes = 20;

  get widthInNotes(): number { return this._widthInNotes; }
  set widthInNotes(value: number) { this._widthInNotes = value; }

  private _heightInNotes = 20;

  get heightInNotes(): number { return this._heightInNotes; }
  set heightInNotes(value: number) { this._heightInNotes = value; }

  private _canvasWidth = 600;

  get canvasWidth(): number { return this._canvasWidth; }
  set canvasWidth(value: number) { this._canvasWidth = value; }

  private _canvasHeight = 600;

  get canvasHeight(): number { return this._canvasHeight; }
  set canvasHeight(value: number) { this._canvasHeight = value; }
}

class NoteViewModel extends Base implements ISelectableThing {
  private _noteWidth = C.NoteWidth;

  get noteWidth(): number { return this._noteWidth; }
  set noteWidth(value: number) { this._noteWidth = value; }

  private _noteHeight = C.NoteHeight;

  get noteHeight(): number { return this._noteHeight; }
  set noteHeight(value: number) { this._noteHeight = value; }

  private _notes: NoteModel[] = [];

  get notes(): NoteModel[] { return this._notes; }

  //
  // ISelectableThing
  //

  // TODO: Decompose out a "find note w/ (x, y)"
  // TODO: should consider note start and end positions

  hasSomethingToSelectAt(x: number, y: number): boolean {
    var normalizedX = Math.floor(x / this.noteWidth);
    var normalizedY = Math.floor(y / this.noteHeight);

    for (var note of this.notes) {
      if (note.x == normalizedX && note.y == normalizedY) {
        return true;
      }
    }

    return false;
  }

  selectAt(x: number, y: number): void {
    var normalizedX = Math.floor(x / this.noteWidth);
    var normalizedY = Math.floor(y / this.noteHeight);

    // Deselect any old selected note (TODO could be optimized)

    for (var note of this.notes) {
      if (note.uiState.selected) {
        note.uiState.selected = false;
      }
    }

    // Select new note

    for (var note of this.notes) {
      if (note.x == normalizedX && note.y == normalizedY) {
        note.uiState.selected = true;

        break;
      }
    }
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

class NoteView extends Base implements IDrawableThing {
  public model: NoteViewModel = new NoteViewModel();

  constructor() {
    super();

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

  public render(context: CanvasRenderingContext2D): void {
    var model = this.model;

    // Draw notes

    for (var note of model.notes) {
      if (note.uiState.selected) {
        context.fillStyle = "rgb(255, 100, 100)";
      } else {
        context.fillStyle = "rgb(255, 0, 0)";
      }

      context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth, model.noteHeight);
    }
  }
}

// TODO
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?

class PianoRollView extends Base {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private model: PianoRollModel;

  private selectableThings: ISelectableThing[];
  private drawableThings: IDrawableThing[];

  constructor() {
    super();

    var noteView: NoteView = new NoteView();

    this.selectableThings = [noteView.model];
    this.drawableThings = [noteView];

    this.model = new PianoRollModel();

    this.canvas = <HTMLCanvasElement> document.getElementById("main");
    this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

    this.setUpCanvas();

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
    for (var thing of this.selectableThings) {
     if (thing.hasSomethingToSelectAt(x, y)) {
        thing.selectAt(x, y);

        break;
      }
    }
  }

  // TODO: Once I separate out the grid class, instead of using C.NoteBleh, put that onto the grid model
  private render() {
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
  }

}

var test: PianoRollModel = new PianoRollModel();

test.widthInNotes = 55;


document.addEventListener("DOMContentLoaded", (ev) => {
  var pianoRoll = new PianoRollView();
});